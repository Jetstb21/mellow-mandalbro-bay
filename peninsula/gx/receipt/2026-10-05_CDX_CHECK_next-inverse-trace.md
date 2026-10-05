# 2026-10-05 · GRECO · next inverse trace · open

- CDX finite reconstruction test; predictions saved before execution. Inputs are residues x=0…24, not inferred physical coordinates or original game states.
- [chart] T(x)=6x mod25 has 25 distinct outputs; inverse T⁻¹(y)=21y mod25 reconstructs every input exactly.
- [chart] Control S(x)=x² mod25 has 11 distinct outputs; its largest predecessor group has five inputs. Deterministic squaring alone loses the unique predecessor.
- [chart] At output zero, inputs 0,5,10,15,20 are indistinguishable without more information; this is an explicit collision control.
- [chart] A receipt recording the input's ordinal in the output's sorted predecessor list reconstructs all 25 inputs exactly. The inverse depends on retaining that receipt and declaring the model.
- The receipt supplies branch information; this is a small known arithmetic construction, not a novel reversibility theorem or evidence that every game receipt is sufficient.
- [Bennett's reversible computation](https://www.cs.princeton.edu/courses/archive/fall06/cos576/papers/bennett73.html) supplies the comparison: preserve lost information, retain output, then reverse the work. Our test verifies reconstruction only, not reversible hardware or history disposal.
- Cost remains open: branch metadata, inverse lookup and storage are additional work. No energy benchmark or savings percentage was measured.
- Next: apply the same collision/reconstruction test to one recovered Gutshot transition including schedule phase and burst state; retain failures as missing-state receipts.
- Evidence: exact finite derivation and exhaustive reconstruction; local prediction, probe and JSON results included in the session pack. Proof skim distinguishes bounded arithmetic from open game mapping; no finished-tier promotion.
