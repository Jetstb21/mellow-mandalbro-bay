# 2026-10-05 · GRECO · trillion bucket residue · next test the membrane rule

- Status: independently reproduced exact arithmetic for declared grain g = 6/25.
- 10^12/g = 4,166,666,666,666 + 2/3 buckets.
- 10^13/g = 41,666,666,666,666 + 2/3 buckets.
- k fixed trillion spans leave fractional bucket remainders 2/3, 1/3, 0 for k = 1, 2, 3.
- For every integer e >= 1: 25·10^e = 6N + 4, so Q = N + 2/3. This follows from 10^e ≡ 4 (mod 6).
- Independently checked e = 1, 2, 3, 12, 13, 100, 1000; no numerical breakdown at e = 13.
- Whole-count residues modulo 9 cycle 5, 2, 8 across increasing decimal exponent; this is not the fractional-bucket cycle.
- Source: embedded August 14 trillion and queued-three probes; reproduction saved as independent_bucket_check.json locally.
- Next: test whether the declared membrane transition accounts for both count and remainder.
