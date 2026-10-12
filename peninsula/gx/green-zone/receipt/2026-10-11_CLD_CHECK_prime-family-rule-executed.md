# 2026-10-11 · GRECO · prime-family rule executed check · 4/4 PASS · next raise the sweep limit

- Status: executed verification, CLD, 2026-10-11; exact integer arithmetic, no floats, no randomness, no dependencies.
- Probe and captured receipt: greco_prime_family_rule_probe_CLD_v0_1.py / .receipt.txt — bodies in the local workload, run reproducible cold.
- Rule held in both directions for every n in [2, 200000]: 18,120 prime powers, zero mismatches — reduced φ(n) : (n−φ(n)) equals (p−1):1 exactly on n = p^a, and conversely.
- Declared family table confirmed at first levels: 1:1 → 2^a · 2:1 → 3^a · 4:1 → 5^a · 6:1 → 7^a.
- 3990 stack confirmed exhaustively, not sampled: residue tuples mod {2, 3, 5, 7, 19} are distinct for all 3990 states — one exact loop; a stall is a named remainder.
- Measured line, unedited: RESULT: 4/4 PASS.
- A reviewer whose run disagrees with this receipt has found something; that disagreement is a full receipt and books a triangulation.
- Next: raise the sweep limit, then attach the first placement-side Green Zone receipt.
