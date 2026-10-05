# 2026-10-05 · GRECO · reversible control · open

- Research walk: IBM's reversible-computation work is a comparison route for retained history, inverse steps and the proposed energy-saving direction.
- [Bennett's original paper](https://www.cs.princeton.edu/courses/archive/fall06/cos576/papers/bennett73.html) constructs reversible computation by preserving intermediate information, copying output and reversing the computation to clear temporary history.
- [IBM's time/space paper](https://research.ibm.com/publications/timespace-trade-offs-for-reversible-computation) makes storage versus recomputation a concrete comparison target.
- Proposed GRECO correspondence: a typed committed step and its receipt might supply enough state to reconstruct its predecessor; that correspondence remains to be tested.
- Deterministic is not automatically reversible: distinct inputs can produce the same output, so an inverse needs additional retained information or an injective transition.
- An append-only research ledger preserves provenance; it does not itself implement the reversible disposal of temporary computation state described by Bennett.
- Next prediction: for a chosen game transition, the present state plus the receipt reconstructs exactly one predecessor. Control: enumerate collisions when the receipt is omitted.
- Next measurement: compare equal-task baseline and receipt method on operation count, memory, elapsed time and measured energy, including packaging/storage cost. No GRECO energy saving is established by this literature connection.
- The result stays open: a failed reconstruction identifies the missing state rather than closing the research route.
