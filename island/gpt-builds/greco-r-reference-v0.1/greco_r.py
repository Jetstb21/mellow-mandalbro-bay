#!/usr/bin/env python3
"""GRECO R-System reference kernel v0.1: deterministic, standard-library only.

Scope: exact arithmetic, address reconstruction, FOL lattice, exploratory chess
move geometry, and append-only Island receipts. No authentication, encryption,
cryptographic digests, or guaranteed uniqueness beyond declared moduli.
"""
from __future__ import annotations
import argparse
from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timezone
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import json
import math
import re
import sys

VERSION = '0.1.0'


def digits(raw: str) -> str:
    if not raw or not raw.isascii() or not raw.isdecimal():
        raise ValueError('Supply a nonempty ASCII decimal digit string; leading zeroes preserved.')
    return raw


def nine_fold(raw: str) -> dict:
    s = digits(raw)
    summed = sum(int(ch) for ch in s)
    residue = summed % 9
    root = 0 if all(ch == '0' for ch in s) else (residue or 9)
    return {'digits': s, 'sum': summed, 'mod9': residue, 'digital_root': root}


def mac_ticket(raw: str) -> dict:
    s = digits(raw)
    n = int(s)
    nine = nine_fold(s)
    return {'input': s, 'mod7': n % 7, 'mod9': nine['mod9'],
            'mod11': n % 11, 'mod13': n % 13, 'mod19': n % 19,
            'mod6': n % 6, 'mod10': n % 10,
            'sum': nine['sum'], 'digital_root': nine['digital_root'],
            'ticket': [n % 7, n % 9, n % 19]}


def mod_mac_handcheck(raw: str, modulus: int) -> int:
    """Elementary hand methods; output is conventional residue 0..modulus-1."""
    s = digits(raw)
    if modulus == 9:
        return sum(int(c) for c in s) % 9
    if modulus == 11:
        return sum((1 if i % 2 == 0 else -1) * int(d)
                   for i, d in enumerate(reversed(s))) % 11
    if modulus not in (7, 13, 19):
        raise ValueError('Hand rule supports 7, 9, 11, 13, 19.')
    coeff = {7: 2, 13: 9, 19: 5}[modulus]
    n = int(s)
    while n >= 100:
        n = coeff * (n // 100) + n % 100
    return n % modulus


def crt(residues: list[int], moduli: list[int]) -> dict:
    """CRT including non-coprime moduli; unique representative modulo LCM."""
    if len(residues) != len(moduli) or not residues:
        raise ValueError('Nonempty residues and moduli must match in length.')
    x, m = 0, 1
    for r, n in zip(residues, moduli):
        if n < 2:
            raise ValueError('Moduli must be at least 2.')
        r %= n
        g = math.gcd(m, n)
        if (r - x) % g:
            raise ValueError(f'Incompatible residue pair modulo shared factor {g}.')
        n1 = n // g
        k = (((r - x) // g) * pow(m // g, -1, n1)) % n1 if n1 > 1 else 0
        x += m * k
        m *= n1
        x %= m
    return {'representative': x, 'period': m, 'residues': residues, 'moduli': moduli}


def kiss6_encode(raw: str) -> dict:
    """Simplified *decimal digit* 6q+r representation, not full conjectural KISS-6."""
    s = digits(raw)
    pairs = [divmod(int(d), 6) for d in s]
    return {'version': VERSION, 'encoding': 'ASCII decimal digit', 'length': len(s),
            'residues': [r for q, r in pairs], 'quotients': [q for q, r in pairs],
            'buckets': {str(i): [j for j, (_, r) in enumerate(pairs) if r == i]
                        for i in range(6)}, 'readout': 'silent_machine_metadata'}


def kiss6_decode(payload: dict) -> str:
    rr = payload['residues']; qq = payload['quotients']
    if not len(rr) == len(qq) == payload['length']:
        raise ValueError('Length mismatch, cannot reconstruct.')
    result = []
    for r, q in zip(rr, qq):
        if not isinstance(r, int) or not isinstance(q, int) or r not in range(6) or q not in (0, 1):
            raise ValueError('Invalid digit residue or quotient.')
        d = 6*q + r
        if d > 9:
            raise ValueError('Not an ASCII decimal digit.')
        result.append(str(d))
    return ''.join(result)


@dataclass(frozen=True)
class Q3:
    """Exact element a+b*sqrt(3); Fraction arithmetic in both components."""
    a: F = F(0)
    b: F = F(0)
    def __add__(self, z): return Q3(self.a+z.a, self.b+z.b)
    def __neg__(self): return Q3(-self.a, -self.b)
    def __sub__(self, z): return self + (-z)
    def __mul__(self, z):
        if isinstance(z, (int, F)): return Q3(self.a*z, self.b*z)
        return Q3(self.a*z.a + 3*self.b*z.b, self.a*z.b + self.b*z.a)
    def show(self): return {'rational': str(self.a), 'sqrt3_coefficient': str(self.b)}


def pair(x, y): return (Q3(F(x)), Q3(F(y)))


def rotation90(p):
    x, y = p
    return (-y, x)


def reflection345(p):
    x, y = p
    return ((x*F(7) + y*F(24))*F(1,25), (x*F(24)-y*F(7))*F(1,25))


def triangular_axial_to_cart(a: F, b: F):
    return Q3(a + b/2), Q3(F(0), b/2)


def triangular_cart_to_axial(p):
    x,y=p
    # b = 2*y/sqrt3 = (2/3)*sqrt3*y; valid for Q(sqrt3).
    b=y * Q3(F(0), F(2,3))
    a=x - b*F(1,2)
    return a, b


def rotation60(p):
    """Standard counterclockwise 60 degrees in Q(sqrt3)."""
    x,y=p
    c=Q3(F(1,2)); s=Q3(F(0),F(1,2))
    return (c*x-s*y, s*x+c*y)


def reflection_x(p): return p[0], -p[1]


def geometry_walk(x: int, y: int, operations: list[str]) -> dict:
    p=pair(x,y)
    original=p
    inverse={'r90':['r90','r90','r90'], 'r60':['r60']*5,
             'h345':['h345'], 'xflip':['xflip']}
    for op in operations:
        p={'r90':rotation90,'r60':rotation60,'h345':reflection345,
           'xflip':reflection_x}[op](p)
    endpoint=p
    for op in reversed(operations):
        for inv in inverse[op]:
            p={'r90':rotation90,'r60':rotation60,'h345':reflection345,
               'xflip':reflection_x}[inv](p)
    return {'source': [q.show() for q in original],
            'destination': [q.show() for q in endpoint],
            'reconstruction_ok': p == original, 'steps': operations}


def rotate_axial60(a,b): return -b, a+b

def reflect_axial_x(a,b): return a+b, -b


def square(i): return (i % 8, i // 8)

def index(x,y): return 8*y+x

def rotate_square(i):
    x,y=square(i)
    return index(7-y,x)

def gutshot_dest(i):
    x,y=square(i)
    offsets=[(2,3),(2,-3),(-2,3),(-2,-3),(3,2),(3,-2),(-3,2),(-3,-2)]
    return sorted(index(x+dx,y+dy) for dx,dy in offsets
                  if 0 <= x+dx < 8 and 0 <= y+dy < 8)

def gutshot_moves():
    return [(i,j) for i in range(64) for j in gutshot_dest(i)]

def gutshot_report() -> dict:
    moves=gutshot_moves()
    diff=Counter((j-i)%9 for i,j in moves)
    groups=set()
    for i,j in moves:
        seq=[]
        for _ in range(4):
            seq.append((i,j))
            i,j=rotate_square(i),rotate_square(j)
        groups.add(min(seq))
    return {'board':'8x8', 'piece':'Gutshot 2-3',
            'directed_moves':len(moves), 'undirected_edges':len(moves)//2,
            'rotation_orbits':len(groups), 'mod9_delta_counts':dict(sorted(diff.items())),
            'rows': [{'from':i,'to':j,'source_p7':i%7,'destination_p7':j%7,
                       'delta_p9':(j-i)%9, 'source_xy':square(i),'destination_xy':square(j)}
                      for i,j in moves]}


def safe_title(text: str) -> str:
    return re.sub(r'[^A-Za-z0-9._-]+','_',text)[:95].strip('_') or 'untitled'


def record_pair(base: Path, receipt_id: str, hypothesis: str,
                expected: str, observed: str, status: str, next_prediction: str,
                method: str) -> dict:
    """Append-only record; never edit prior file, never use opaque digests."""
    if status not in ('PASS','FAIL','OPEN','INCONCLUSIVE'):
        raise ValueError('Status must be PASS, FAIL, OPEN, INCONCLUSIVE.')
    if not all([hypothesis,expected,observed,next_prediction,method]):
        raise ValueError('Need test scope, expected, observed, method and next prediction.')
    rid=safe_title(receipt_id)
    stamp=date.today().isoformat()
    root=base/'peninsula'
    for x in ('load','receipt','tri'):
        (root/x).mkdir(parents=True,exist_ok=True)
    def unique(folder, suffix):
        for seq in range(1,100001):
            p=root/folder/(f'{stamp}_{rid}_p{seq:05d}_{suffix}.md')
            if not p.exists(): return p
        raise RuntimeError('Local sequence exhausted.')
    title=f'{stamp} · GRECO · {rid} · {status.lower()} · open'
    machine={'schema':'GRECO-Lineal 0.1','receipt_id':receipt_id,
             'status':status,'operator_scope':method,'next_best_prediction':next_prediction,
             'readout_mode':'silent_machine_metadata','investigation_open':True}
    lp=unique('load','LOAD');rp=unique('receipt','RECEIPT')
    lp.write_text(f'# {title}\n\n## Prediction before test\n{hypothesis}\n\n## Expected\n{expected}\n\n## Test\n{method}\n')
    rp.write_text(f'# {title}\n\n## Observed\n{observed}\n\n## Status\n{status}\n\n## Next-best prediction\n{next_prediction}\n\n## Machine title / silent\n```json\n{json.dumps(machine,indent=2)}\n```\n')
    tri=None
    if status=='FAIL':
        tri=unique('tri','TRI')
        tri.write_text(f'# {title}\n\nFailed scoped prediction: {hypothesis}\n\nExpected: {expected}\n\nObserved: {observed}\n\nNext: {next_prediction}\n\nInvestigation open. Do not overwrite the original.\n')
    return {'load':str(lp),'receipt':str(rp),'tri':str(tri) if tri else None}


def local_inventory(root: Path, max_files: int=10000) -> dict:
    """Read-only metadata only. No file content exported. Avoid private OS trees."""
    if not root.is_dir(): raise FileNotFoundError(root)
    interesting={'.py','.md','.csv','.json','.jsonl','.txt','.docx','.xlsx'}
    excluded={'.git','.ssh','.config','node_modules','.venv','venv','AppData','Secrets','secrets'}
    out=[]
    for p in sorted(root.rglob('*')):
        if any(c in excluded for c in p.parts): continue
        if p.is_file() and p.suffix.lower() in interesting:
            st=p.stat()
            out.append({'path':str(p.relative_to(root)),'bytes':st.st_size,'extension':p.suffix.lower()})
            if len(out)>=max_files: break
    return {'root':str(root),'scanned_count':len(out),'truncated':len(out)>=max_files,
            'files':out,'scope':'local metadata, not public or copied'}


def main(argv=None):
    p=argparse.ArgumentParser(description='GRECO exact R-system reference kernel')
    p.add_argument('--version',action='version',version=VERSION)
    s=p.add_subparsers(dest='command',required=True)
    s.add_parser('test')
    rul=s.add_parser('rulers');rul.add_argument('digits')
    hand=s.add_parser('hand');hand.add_argument('digits')
    enc=s.add_parser('kiss-encode');enc.add_argument('digits')
    dec=s.add_parser('kiss-decode');dec.add_argument('payload_json')
    c=s.add_parser('crt');c.add_argument('moduli');c.add_argument('residues')
    g=s.add_parser('geometry');g.add_argument('x',type=int);g.add_argument('y',type=int)
    g.add_argument('operations',nargs='*',choices=['r60','r90','h345','xflip'])
    s.add_parser('gutshot')
    r=s.add_parser('record');r.add_argument('root');r.add_argument('id');r.add_argument('status',choices=['PASS','FAIL','OPEN','INCONCLUSIVE']);r.add_argument('prediction');r.add_argument('expected');r.add_argument('observed');r.add_argument('method');r.add_argument('next_prediction')
    inv=s.add_parser('inventory');inv.add_argument('root');inv.add_argument('--max-files',type=int,default=10000)
    a=p.parse_args(argv)
    if a.command=='test':
        from tests.test_reference import run
        result=run(); print(json.dumps(result,indent=2));return 0
    elif a.command=='rulers': out=mac_ticket(a.digits)
    elif a.command=='hand': out={str(m):mod_mac_handcheck(a.digits,m) for m in (7,9,11,13,19)}
    elif a.command=='kiss-encode': out=kiss6_encode(a.digits)
    elif a.command=='kiss-decode': out={'reconstructed':kiss6_decode(json.loads(a.payload_json))}
    elif a.command=='crt': out=crt([int(i) for i in a.residues.split(',')],[int(i) for i in a.moduli.split(',')])
    elif a.command=='geometry': out=geometry_walk(a.x,a.y,a.operations)
    elif a.command=='gutshot':
        out=gutshot_report();out.pop('rows')
    elif a.command=='record':out=record_pair(Path(a.root),a.id,a.prediction,a.expected,a.observed,a.status,a.next_prediction,a.method)
    elif a.command=='inventory':out=local_inventory(Path(a.root),a.max_files)
    else: raise ValueError(a.command)
    print(json.dumps(out,indent=2))
    return 0

if __name__=='__main__':
    sys.exit(main())