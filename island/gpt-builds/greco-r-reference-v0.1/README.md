# GRECO R-System — Family Reference Build v0.1

**2026-10-15. Public-release candidate.** Original exploratory GRECO work is a multi-model collaboration; this package is a new independently tested reference implementation, **not a claim that every historical GRECO operator has been integrated or independently validated.** Team approval for new etiquette remains pending.

## Quick start in Ubuntu / WSL (Python 3.10+)

```bash
cd GRECO_R_Family_Release_v0_1
python3 greco_r.py test
python3 greco_r.py rulers 314159265358979323
python3 greco_r.py hand 6667
python3 greco_r.py crt 25,72 5,11
python3 greco_r.py kiss-encode 000666789
python3 greco_r.py geometry 1 2 r60 h345 r90 xflip r60
python3 greco_r.py gutshot
python3 greco_r.py inventory /mnt/c/Users/Sator --max-files 10000
python3 greco_r.py inventory /mnt/c/Users/ASSUR --max-files 10000
```

Run `python3 greco_r.py --help` for all commands. No dependencies, setup scripts, cloud credentials, native compilation, telemetry, or internet required. The folder inventory is read-only and returns **filenames, extensions, and sizes**, not document contents. Mounted Windows paths above are examples, not a claim that the files are accessible in this runtime. Never publish a local inventory or private source list automatically.

## System architecture

```text
Incoming explicit numbers or sanctioned datasets
    |
    v
Exact integer / Fraction carrier ---- Unknown operator stays UNKNOWN
    |                 |
    +--> Mod Mac: 7 / 9 / 11 / 13 / 19; mod 6 and mod 10 support
    +--> KISS-6 simplified digit witness (residue + quotient)
    +--> CRT address: 16×9 / 25×72 / 7×9×19 / shared-factor 6||9
    +--> R/r geometry: exact 3-4-5 7-24-25 reflection, Q(sqrt3)
    +--> FOL native D6 axial grid, long mixed-frame inverse walks
    +--> Gutshot chess geometry and mod7/mod9 movement receipts
    |
    v
Island pair: left LOAD -> right RECEIPT (+ TRI on failure)
    |
    +--> short human title, verbose silent GRECO-Lineal metadata
    +--> next-best falsifiable prediction, attribution, open peninsula
    |
    v
PUBLIC gate (manual): independently checked mathematics only
BIO peninsula (separate): evidence review, never automatic medical inference
```

## Exact verification and failure discipline

`python3 greco_r.py test` prints the run's categories. Exhaustive finite checks and classical exact identities **do not establish novel mathematical theorems beyond the stated domain**. The test runner also intentionally checks two failures: simplified KISS-6 residue collisions (0/6) and non-closure of a fixed denominator-25 raster under a 3-4-5 reflection. Those are retained as useful scope delimiters. A third incompatible 6/9 residue check must raise an exception.

`kiss6_encode` concerns *digit-wise* q/r reconstruction, not the proposed complete GRECO reversible collapse operators. Unknown operators are not reinterpreted as existing ones. The quotient is necessary in this simplified map; this does **not** disprove a different well-specified context-dependent full algorithm.

`Q3` stores `a+b√3` exactly using `Fraction`; transform inverses preserve state. Large mixed-frame walks can grow numerators/denominators: assess computational cost and equal-bit-budget comparisons before claiming compression or scalability.

## Important security and operational scope

No hashing, no cryptography, no digital signatures or authentication. That is an intentional project property, **not a security guarantee**. Numeric tickets are easy to reproduce by hand but can collide and are unsuitable as integrity/authenticity checks against malicious modification. Keep private material out of the public repo and use external access controls for any private data.

A Git repository's platform availability and file-size/storage restrictions still apply. This build makes no unlimited-storage claim.

## Documentation

- `docs/ARCHITECTURE.md`: operator contracts, proof vs conjecture, 20 predictions.
- `docs/HEART_LIGHT_EMOTION_PENINSULA.md`: literature-grounded cardiovascular/emotion/light/piezoelectric research, no therapeutic instructions.
- `docs/ORGANIC_CHEMISTRY_101.md`: first class, professional study ladder, answer-key separation.
- `tests/test_reference.py`: reproducible exact test definitions.
- `examples/PRO20_ledger.csv`: 20 individually scoped predictions, not 20 arbitrary asserted passes.

## Contribution / Island routing

Never overwrite the source record. Proposed changes add a dated load, receipt, and tri on verified failure. Detailed GRECO-Lineal data rides silently; original short human Title Law remains intact. Each public item carries author/model stamp, mathematical domain, test method, precise expected/observed, and next prediction. A disproven proposition remains disproven *in its scope*; wider exploration remains open. Avoid promoting the old work's historical statements to a fresh verification unless rerun.

The underlying research spans GPT, Claude, Grok, Gemini and other collaborators. This release is GPT's implementation and does not imply other model approval.