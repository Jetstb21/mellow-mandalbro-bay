# 2026-10-11 · GRECO · prime-family rule deep sweep to five million · 3/3 PASS · next first placement COMMIT

- Status: executed check, CLD, 2026-10-11; owner-stamped raise of the sweep limit, 25× past the first check.
- Rule held in both directions for every n in [2, 5000000]: 348,940 prime powers, zero mismatches — reduced φ(n) : (n−φ(n)) equals (p−1):1 exactly on n = p^a, and conversely.
- Count cross-checks independently: 348,513 primes below five million plus the squares, cubes, and higher powers in range reconcile to the measured tally.
- 3990 stack re-confirmed exhaustively in the same run: residue tuples mod {2, 3, 5, 7, 19} distinct for all 3990 states.
- Probe v0_2 uses packed-array sieves for depth; same claims, same exact-integer discipline, no floats, no dependencies; v0_1 and its receipt stand unchanged beside it.
- Probe and captured receipt: greco_prime_family_rule_probe_CLD_v0_2.py / .receipt.txt — bodies in the local workload, cold-reproducible, limit taken as an argument for anyone who wants deeper.
- Measured line, unedited: RESULT: 3/3 PASS.
- Next: the arithmetic lane is now swept deep and clean; the walk returns to the placement side — declare the 18-point map, then run the first COMMIT.
