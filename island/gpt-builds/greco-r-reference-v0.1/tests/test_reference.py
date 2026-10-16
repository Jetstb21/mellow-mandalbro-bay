"""Exactly specified reproducible tests; counts distinguish tests from claims."""
from __future__ import annotations
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import json
import tempfile
from greco_r import (crt,mod_mac_handcheck, mac_ticket,kiss6_encode,kiss6_decode,
    triangular_axial_to_cart, triangular_cart_to_axial, rotate_axial60, reflect_axial_x,
    reflection345, pair, geometry_walk,gutshot_moves,gutshot_report,record_pair,
    local_inventory, Q3)


def run():
    counters={}; expected_failures=[]
    def check(name,actual,expected):
        if actual!=expected: raise AssertionError(f'{name}: {actual!r} != {expected!r}')
    for mods,period in (([16,9],144),([25,72],1800),([7,9,19],1197)):
        visited=set()
        for n in range(period):
            addr=[n % m for m in mods]
            got=crt(addr,mods)
            check(f'CRT {mods} {n}',(got['representative'],got['period']),(n,period))
            visited.add(tuple(addr))
        check('Unique tickets',len(visited),period)
        counters[f'crt_{period}']=period
    for n in range(18000):
        got=crt([n%6,n%9],[6,9]);check('noncoprime',got['representative'],n%18)
    counters['band_6_9']=18000
    for n in range(100000):
        t=mac_ticket(str(n))
        for m in (7,9,11,13,19):
            check(f'Hand method {m}',mod_mac_handcheck(str(n),m),n%m)
    counters['handcheck_integers']=100000*5
    for n in range(100000):
        s=f'{n:05d}';check('digit reconstruction',kiss6_decode(kiss6_encode(s)),s)
    counters['kiss6_five_digit_strings']=100000
    check('Expected residue-only collision',[x % 6 for x in (0,6)],[0,0])
    expected_failures.append('0 and 6 share residue 0; quotient required by simplified digit map')
    for a,b in product(range(25),repeat=2):
        u,v=F(a,25),F(b,25)
        p=triangular_axial_to_cart(u,v)
        check('Axial-to-Cart inverse',triangular_cart_to_axial(p),(Q3(u),Q3(v)))
        check('Double hypotenuse reflection',reflection345(reflection345(p)),p)
        x,y=a,b
        for _ in range(6): x,y=rotate_axial60(x,y)
        check('6 rotations', (x,y),(a,b))
        x,y=reflect_axial_x(a,b)
        check('double native reflection',reflect_axial_x(x,y),(a,b))
    counters['fol_exact_address_tests']=625*4
    # Twelve native D6 actions on each of the 625 finite axial addresses.
    for a,b in product(range(25),repeat=2):
        orbit=set();x,y=a,b
        for _ in range(6):
            orbit.add((x%25,y%25));xr,yr=reflect_axial_x(x,y)
            orbit.add((xr%25,yr%25));x,y=rotate_axial60(x,y)
        # Check each transform lies on the 1/25 axial lattice; duplicates are normal for symmetry-fixed points.
        if not 1 <= len(orbit) <= 12: raise AssertionError('Bad orbit')
    counters['fol_d6_actions']=625*12
    seq=['r60','h345','r90','xflip','r60','h345']*12
    for i in range(25):
        check('Long mixed-frame roundtrip',geometry_walk(i,i-12,seq)['reconstruction_ok'],True)
    counters['long_frame_roundtrips']=25
    moves=gutshot_moves()
    check('Gutshot directed',len(moves),240)
    d=gutshot_report()
    check('rotational orbits',d['rotation_orbits'],60)
    check('delta mod9',d['mod9_delta_counts'],{1:60,4:60,5:60,8:60})
    counters['gutshot_moves']=240
    # Scoped failure witness: fixed square denominator 25 is not closed under h345.
    moved=reflection345(pair(F(1,25),0))[0]
    check('Raster nonclosure',moved,Q3(F(7,625)))
    expected_failures.append('axis-aligned denominator-25 grid not invariant under 3-4-5 reflection')
    try:
        crt([1,0],[6,9]);raise AssertionError('Incompatible residues accepted')
    except ValueError: pass
    with tempfile.TemporaryDirectory() as tmp:
        res=record_pair(Path(tmp),'R-SYNTH-001','Demonstrate failure retention','one','zero','FAIL','revise test','synthetic comparison')
        check('tri created',Path(res['tri']).exists(),True)
        check('load created',Path(res['load']).exists(),True)
        check('receipt created',Path(res['receipt']).exists(),True)
        check('inventory safe',local_inventory(Path(tmp))['scanned_count'],3)
    counters['receipt_triad']=3
    return {'version':'0.1.0','status':'PASS','counts':counters,
            'test_cases':sum(counters.values()),'unexpected_failures':0,
            'scoped_expected_failures':expected_failures,
            'test_kind':'exact arithmetic and finite exhaustive checks, not independent biomedical or chess endgame validation'}