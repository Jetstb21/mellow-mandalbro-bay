#!/usr/bin/env python3
"""Public reference: new mod9 reads old GRECO shell stack. No hashing or crypto.
Synthetic exact-address instrument. n=opp out remains an UNVERIFIED old term.
Full test runner and tables accompany downloadable project ZIP.
"""
from math import gcd, lcm, sin, pi
from fractions import Fraction

SHELLS=(3,4,5,6,7,8,9,10,16,64)
LIVE={1,2,4,5,7,8}
def read(n:int,c:int=5)->dict:
    seat=n%9
    if c<=0: raise ValueError("positive hypotenuse required")
    return {
        "n_exact":n,
        "shell":n if n in SHELLS else None,
        "seat9":seat,
        "zone":"LIVE" if seat in LIVE else "EDGE" if seat in (3,6) else "CENTRE",
        "opp_output_additive9":(-n)%9,
        "inverse_multiplicative9":pow(seat,-1,9) if gcd(seat,9)==1 else None,
        "stage_times3":(3*seat)%9,
        "stage_times3_again":(9*seat)%9,
        "g_c_squared_phase":n%(c*c),
        "negative_fol60_click":(-n)%60,
        "opposite_spatial_halfturn_click":((-n)%60+30)%60,
        "ticket_7_9_19":(n%7,seat,n%19),
        "joint_repeat_period":lcm(c*c,60,9),
    }

def tangency_grain(a,b,c):
    if a*a+b*b!=c*c: raise ValueError("right triangle required")
    s=Fraction(a+b+c,2)
    g=((s-a)/c)*((s-b)/c)
    assert g==Fraction(a*b,2*c*c)
    return g

def probe():
    units=[i for i in range(9) if gcd(i,9)==1]
    assert units==[1,2,4,5,7,8]
    assert [pow(2,i,9) for i in range(1,7)]==[2,4,8,7,5,1]
    for n in range(-100000,100001):
        a=read(n)
        assert (a["seat9"]+a["opp_output_additive9"])%9==0
        if a["inverse_multiplicative9"] is not None:
            assert a["seat9"]*a["inverse_multiplicative9"]%9==1
        assert a["negative_fol60_click"]==read(n+60)["negative_fol60_click"]
    for c,clock in [(5,900),(13,30420),(17,52020),(25,22500)]:
        assert lcm(c*c,60,9)==clock
        seen={(n%(c*c),(-n)%60,n%9) for n in range(clock)}
        assert len(seen)==clock
    assert tangency_grain(3,4,5)==Fraction(6,25)
    assert tangency_grain(5,12,13)==Fraction(30,169)
    assert read(7)["seat9"]==read(16)["seat9"]
    assert read(0)["seat9"]==read(900)["seat9"]  # finite alias
    assert abs(2*7*sin(pi/7)-2*16*sin(pi/16))>0.01
    print("PASS: exact-address baseline, not a physical theorem.")
if __name__=="__main__":
    import json
    probe()
    for n in SHELLS+(60,180,900):
        print(json.dumps(read(n),sort_keys=True))
