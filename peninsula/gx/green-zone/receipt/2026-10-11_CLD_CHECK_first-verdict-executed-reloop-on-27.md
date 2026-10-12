# 2026-10-11 · GRECO · first green zone verdict executed · RELOOP on n = 27 · next declare the 18-point placement map

- Status: executed check, CLD, 2026-10-11; exact integers, no floats; gate table transcribed from the 2026-09-19 review, section 6; 5/5 PASS.
- One click, one verdict: the review's own proposed packet (n = 27, φ = 18, no-mod = 9, family 3, level 3, placement unfilled) ran the gate and returned RELOOP — bounded re-evaluation, matching the review's example verbatim.
- Substrate confirmed exactly: 18 units mod 27, reduced ratio 18:9 = 2:1, family 3, level 3.
- Refusal paths measured, not assumed: a corrupt φ rejects; a prematurely filled placement cannot COMMIT because no placement rule is declared — COMMIT is unreachable by construction.
- The hold is the finding: the gate correctly refuses to promote arithmetic into placement while the map from the 18 units of mod 27 onto the 18 placed points stays open.
- Transitions beyond the review's example are marked UNVERIFIED in the probe and kept deliberately narrow.
- Probe and captured receipt: greco_green_zone_gate_probe_CLD_v0_1.py / .receipt.txt — bodies in the local workload, cold-reproducible.
- Measured line, unedited: RESULT: 5/5 PASS.
- Next: declare the 18-point placement map on the discovery side; the first COMMIT verdict waits on it.
