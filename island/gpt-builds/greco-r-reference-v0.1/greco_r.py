#!/usr/bin/env python3
"""GRECO R reference kernel. Integer/Fraction operations only. Python 3.10+."""
import argparse
from collections import Counter
from datetime import date
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import json, math, re

def clean(s):
    if not s or not s.isascii() or not s.isdecimal(): raise ValueError("ASCII decimal digits required")
    return s

def rulers(s):
    s=clean(s); n=int(s); ds=sum(int(c) for c in s)
    return {"digits":s,"mod7":n%7,"mod9":ds%9,"mod11":n%11,"mod13":n%13,
            "mod19":n%19,"mod6":n%6,"mod10":n%10,"digit_sum":ds,
            "digital_root":(ds%9 or 9) if n else 0,"ticket":[n%7,ds%9,n%19]}

def hand(s,m):
    s=clean(s)
    if m==9:return sum(map(int,s))%9
    if m==11:return sum((1 if i%2==0 else -1)*int(c) for i,c in enumerate(s[::-1]))%11
    if m not in (7,13,19):raise ValueError("Use 7,9,11,13,19")
    n=int(s); c={7:2,13:9,19:5}[m]
    while n>=100:n=c*(n//100)+n%100
    return n%m

def crt(mods,rs):
    if not mods or len(mods)!=len(rs):raise ValueError("moduli/residues length")
    x,m=0,1
    for n,r in zip(mods,rs):
        if n<2:raise ValueError("modulus >= 2 required")
        g=math.gcd(m,n)
        if (r-x)%g:raise ValueError("Incompatible moduli")
        k=((r-x)//g*pow(m//g,-1,n//g))%(n//g) if n//g>1 else 0
        x=(x+m*k)%(m*(n//g));m*=n//g
    return {"representative":x,"period":m}

def kiss6(s):
    s=clean(s);p=[divmod(int(c),6) for c in s]
    return {"length":len(s),"residues":[r for q,r in p],
            "quotients":[q for q,r in p],
            "readout":"silent_machine_metadata",
            "scope":"digitwise quotient/remainder, not the conjectural full KISS-6 operator"}

def kiss6_reverse(p):
    r,q=p["residues"],p["quotients"]
    if len(r)!=len(q) or len(r)!=p["length"]:raise ValueError("length mismatch")
    ds=[6*b+a for a,b in zip(r,q)]
    if any(type(a)!=int or a not in range(6) for a in r) or any(type(b)!=int or b not in (0,1) for b in q) or any(d>9 for d in ds):
        raise ValueError("bad residue or quotient")
    return ''.join(map(str,ds))

class Q3:
    """a+b*sqrt(3), exact rational coefficients."""
    def __init__(self,a=0,b=0):self.a,self.b=F(a),F(b)
    def __add__(self,z):return Q3(self.a+z.a,self.b+z.b)
    def __neg__(self):return Q3(-self.a,-self.b)
    def __sub__(self,z):return self+-z
    def __mul__(self,z):
        if isinstance(z,Q3):return Q3(self.a*z.a+3*self.b*z.b,self.a*z.b+self.b*z.a)
        return Q3(self.a*z,self.b*z)
    def __eq__(self,z):return isinstance(z,Q3) and (self.a,self.b)==(z.a,z.b)
    def to_json(self):return [str(self.a),str(self.b)]
def transform(p,op):
    x,y=p
    if op=="r90":return (-y,x)
    if op=="xflip":return (x,-y)
    if op=="h345":return ((x*7+y*24)*F(1,25),(x*24-y*7)*F(1,25))
    if op=="r60":
        c,s=Q3(F(1,2)),Q3(0,F(1,2))
        return (c*x-s*y,s*x+c*y)
    raise ValueError("Unknown geometric operator")
def walk(x,y,ops):
    p=(Q3(x),Q3(y));start=p
    for op in ops:p=transform(p,op)
    dest=p
    inverse={"r60":6,"r90":4,"h345":2,"xflip":2}
    for op in reversed(ops):
        for _ in range(inverse[op]-1):p=transform(p,op)
    return {"end":[v.to_json() for v in dest],"reconstruction_ok":p==start,"operations":ops}

def gutshot():
    offsets=[(2,3),(2,-3),(-2,3),(-2,-3),(3,2),(3,-2),(-3,2),(-3,-2)]
    moves=set()
    for y,x in product(range(8),repeat=2):
        for dx,dy in offsets:
            xx,yy=x+dx,y+dy
            if 0<=xx<8 and 0<=yy<8:moves.add((8*y+x,8*yy+xx))
    def rot(i):
        x,y=i%8,i//8
        return 8*x+7-y
    orbits=set()
    for a,b in moves:
        four=[];x,y=a,b
        for _ in range(4):four.append((x,y));x,y=rot(x),rot(y)
        orbits.add(min(four))
    return {"directed_moves":len(moves),"undirected_edges":len(moves)//2,
            "rotation_orbits":len(orbits),
            "mod9_delta_counts":dict(sorted(Counter((b-a)%9 for a,b in moves).items()))}

def record(root,ident,status,prediction,expected,observed,method,next_prediction):
    if status not in ("PASS","FAIL","OPEN","INCONCLUSIVE"):raise ValueError("bad status")
    root=Path(root)/"peninsula";id=re.sub('[^a-zA-Z0-9_-]','_',ident)[:80]
    names={"load":"LOAD","receipt":"RECEIPT"}
    if status=="FAIL":names["tri"]="TRI"
    ans={}
    for folder,suffix in names.items():
        dest=root/folder;dest.mkdir(parents=True,exist_ok=True)
        idx=1
        while True:
            path=dest/f"{date.today().isoformat()}_{id}_p{idx:05d}_{suffix}.md"
            if not path.exists():break
            idx+=1
        title=f"{date.today().isoformat()} · GRECO · {id} · {status.lower()} · open"
        payload=f"# {title}\n\nPrediction: {prediction}\n\nExpected: {expected}\n\nMethod: {method}\n\nObserved: {observed}\n\nStatus: {status}\n\nNext-best prediction: {next_prediction}\n\nInvestigation stays open.\n"
        path.write_text(payload,encoding='utf-8');ans[folder]=str(path)
    return ans

def inventory(folder,max_files=10000):
    root=Path(folder)
    if not root.is_dir():raise ValueError("Directory not mounted")
    excludes={'.git','.ssh','AppData','node_modules','.venv','secrets','Secrets'}
    allowed={'.md','.txt','.py','.json','.csv','.docx','.xlsx'}
    rows=[]
    for p in sorted(root.rglob('*')):
        if any(v in excludes for v in p.parts):continue
        if p.is_file() and p.suffix.lower() in allowed:
            rows.append({"path":str(p.relative_to(root)),"size":p.stat().st_size})
            if len(rows)>=max_files:break
    return {"read_only":True,"no_content_export":True,"files":rows,"truncated":len(rows)>=max_files}

def tests():
    counts={}
    for mods,count in (([16,9],144),([25,72],1800),([7,9,19],1197)):
        for n in range(count):
            a=crt(mods,[n%m for m in mods]);assert a=={"representative":n,"period":count}
        counts[f"crt_{count}"]=count
    for n in range(18000):
        assert crt([6,9],[n%6,n%9])=={"representative":n%18,"period":18}
    counts["band_6_9"]=18000
    for n in range(100000):
        for m in (7,9,11,13,19):assert hand(str(n),m)==n%m
    counts["hand_7_9_11_13_19"]=500000
    for n in range(100000):
        s=f"{n:05d}";assert kiss6_reverse(kiss6(s))==s
    counts["kiss6_digits"]=100000
    for a,b in product(range(25),repeat=2):
        p=(Q3(F(a,25)),Q3(F(b,25)))
        assert transform(transform(p,'h345'),'h345')==p
    counts["h345_involution"]=625
    assert walk(1,2,["r60","h345","r90","xflip"]*10)["reconstruction_ok"]
    counts["frame_longwalk"]=1
    assert gutshot()["directed_moves"]==240
    assert gutshot()["rotation_orbits"]==60
    assert gutshot()["mod9_delta_counts"]=={1:60,4:60,5:60,8:60}
    counts["gutshot_move_witness"]=240
    # These are EXPECTED scoped negative controls, not unexpected test failures.
    assert kiss6("0")["residues"]==kiss6("6")["residues"]
    assert transform((Q3(F(1,25)),Q3()),"h345")[0]==Q3(F(7,625))
    return {"status":"PASS","cases":sum(counts.values()),"counts":counts,
            "expected_negative_controls":["residue-only digit collisions","fixed Cartesian G25 nonclosure"],
            "note":"No medical or tablebase claims from exact arithmetic checks"}
def cli():
    p=argparse.ArgumentParser(description="GRECO R public reference kernel")
    sub=p.add_subparsers(dest="op",required=True)
    for name in ("test","gutshot"):sub.add_parser(name)
    for name in ("rulers","hand","kiss-encode"):sub.add_parser(name).add_argument("digits")
    c=sub.add_parser("crt");c.add_argument("moduli");c.add_argument("residues")
    d=sub.add_parser("kiss-decode");d.add_argument("payload_json")
    g=sub.add_parser("geometry");g.add_argument("x",type=int);g.add_argument("y",type=int)
    g.add_argument("operations",nargs="*",choices=["r60","r90","h345","xflip"])
    i=sub.add_parser("inventory");i.add_argument("folder");i.add_argument("--max-files",type=int,default=10000)
    r=sub.add_parser("record")
    for arg in ("root","id","status","prediction","expected","observed","method","next_prediction"):r.add_argument(arg)
    a=p.parse_args()
    if a.op=="test":out=tests()
    elif a.op=="rulers":out=rulers(a.digits)
    elif a.op=="hand":out={str(m):hand(a.digits,m) for m in (7,9,11,13,19)}
    elif a.op=="kiss-encode":out=kiss6(a.digits)
    elif a.op=="kiss-decode":out={"reconstructed":kiss6_reverse(json.loads(a.payload_json))}
    elif a.op=="crt":out=crt([int(x) for x in a.moduli.split(',')],[int(x) for x in a.residues.split(',')])
    elif a.op=="geometry":out=walk(a.x,a.y,a.operations)
    elif a.op=="gutshot":out=gutshot()
    elif a.op=="inventory":out=inventory(a.folder,a.max_files)
    elif a.op=="record":out=record(a.root,a.id,a.status,a.prediction,a.expected,a.observed,a.method,a.next_prediction)
    print(json.dumps(out,indent=2))
if __name__=="__main__":cli()
