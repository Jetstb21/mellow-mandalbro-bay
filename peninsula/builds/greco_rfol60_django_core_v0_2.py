#!/usr/bin/env python3
"""GRECO Django RFOL-60 small public exact-arithmetic kernel v0.2."""
from fractions import Fraction as F

def ticket(n): return (n%7, n%9, n%19)
def nine(n): return (n%9, (-n)%9)
def phase(click): return ((click%60), (click%60)*6)
def monotone(): return [5*i for i in range(12)]
def pendulum():
    out=[0]
    for k in range(1,6): out.extend((5*k,60-5*k))
    return out+[30]
def kiss6_encode(s):
    if not s or any(c not in "0123456789" for c in s):
        raise ValueError("Need ASCII decimal string")
    r=[int(c)%6 for c in s]
    locations=[i for i,v in enumerate(r) if v<=3]
    q=[int(s[i])//6 for i in locations]
    return dict(length=len(s),r=r,locations=locations,q=q)
def kiss6_decode(p):
    r=p["r"];loc=p["locations"];q=p["q"]
    if len(r)!=p["length"] or loc!=[i for i,v in enumerate(r) if 0<=v<=3] or len(loc)!=len(q):
        raise ValueError("Corrupt positions")
    if any(not 0<=v<=5 for v in r) or any(v not in (0,1) for v in q):
        raise ValueError("Corrupt digit")
    look=dict(zip(loc,q))
    return "".join(str(v+6*look.get(i,0)) for i,v in enumerate(r))
def billiard(x,margin=1):
    x,m=F(x),F(margin)
    if m<=0:raise ValueError("Invalid margin")
    u=(x+m)%(4*m)
    return u-m if u<=2*m else 3*m-u
def triangle(a=3,b=4,c=5):
    if a*a+b*b!=c*c:raise ValueError("Not a right triangle")
    return dict(r=F(a+b-c,2),R=F(c,2))
def wisdom_center():
    a=(F(3),F(3));b=(F(6),F(9))
    return tuple((x+y)/2 for x,y in zip(a,b))
def selftest():
    assert phase(15)==(15,90)
    assert len(set(monotone()))==12 and sorted(pendulum())==monotone()
    assert pendulum()!=monotone()
    assert nine(8)==(8,1)
    for i in range(10000):
        s=f"{i:04d}";assert kiss6_decode(kiss6_encode(s))==s
    assert billiard(0)==billiard(2)==0
    assert ticket(0)==ticket(1197)
    assert triangle()["r"]==1 and wisdom_center()==(F(9,2),F(6))
    return "All checks passed: a bounded numeric kernel, not a biological theorem."
if __name__=="__main__":print(selftest())
