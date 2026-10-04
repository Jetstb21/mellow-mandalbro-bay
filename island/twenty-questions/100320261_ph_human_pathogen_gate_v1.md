# 20 questions — human pH, sleep, pathogens, and environmental inputs

**Current MD:** Evidence review and calibration of the human pH/pathogen lane  
**MD next (two steps ahead):** Virus- and bacterium-specific pH-stability evidence table, starting with a small, named panel  
**Date:** 2026-10-03 (America/Denver)  
**Status vocabulary:** theorem / user-defined rule / observed / candidate / rejected. Questions do not promote a claim. This is an additive island entry; it does not modify the Peninsula files.

## Scope and safety boundary

This is a literature-grounded conceptual simulation, not a medical protocol. It does not prescribe cold exposure, light treatment, patient rotation, pH manipulation, immune stimulation, phage administration, or treatment of cancer or infection. No patient or pathogen experiment is proposed. A future model may use published, de-identified measurements only.

## Pre-run predictions (written before the 20-question pass)

- **P1 — Compartment rule [candidate]:** A useful pH model will need separate variables for arterial blood, cytosol, organelles, tumor interstitium, and external environment. One “human pH” value or one universal max/min will fail.
- **P2 — No universal pathogen cutoff [candidate]:** Inactivation/survival will depend on organism or virus, life-cycle stage, exposure duration, temperature, medium, and assay. A single pH death threshold will not generalize.
- **P3 — Geometry as index, not cause [candidate]:** A 60-click or nested-mod representation can organize measured values exactly as arithmetic, but its coordinates alone do not establish a biological switch, threshold, causal pathway, or treatment effect.

## Evidence calibration

- Arterial blood pH reference interval: **7.35–7.45**. Values outside that interval define acidemia or alkalemia; they are not a universal “fatal range.” Clinical interpretation uses the pH together with PaCO₂, bicarbonate, the cause, duration, compensation, and the patient's condition.
- pH is logarithmic. Store the original value, sample type, assay, precision, and timestamp. If mapping to clicks, state the chosen endpoints and keep the raw measurement alongside the transformed coordinate. For a purely mathematical 6.00–7.50 span split into 60 equal intervals, ΔpH = 0.025 (Δ[pH×100] = 2.5); that is a coordinate convention, not a physiological clock.
- Tumor measurements show a common pattern of relatively acidic extracellular tumor space and near-neutral or mildly alkaline intracellular pH, with substantial tumor- and method-specific variation. “Click 20 / pH 6.50” is not a universal tumor floor.
- Viral pH stability is virus- and assay-specific. Low pH can trigger entry/fusion for some viruses; that is distinct from loss of infectivity. Do not combine entry threshold, environmental survival, and inactivation into a single “death pH.”
- Bacteriophages infect bacteria. They are not general human-virus competitors. Phage effects are host-specific; safety and ecological consequences depend on the particular phage and its genes.
- I found no evidence supporting a patient “Night Switch” induced by cold plunges, light treatment, or rotation that resets tumor pH or collapses a tumor. These inputs must remain **unvalidated hypotheses**, never interventions in this simulation.

## 20-question run — provisional answers and receipts

1. **What exactly is pH?** A logarithmic expression of hydrogen-ion activity. **Status: observed.** Do not average raw pH values as if the scale were linear.
2. **Can we encode pH×100 or a pH interval with exact integers?** Yes, as a chosen digital representation at declared precision. **Status: exact arithmetic only.** This does not make the measured biology exact or binary-discrete.
3. **What is the reference range for arterial blood?** 7.35–7.45. **Status: observed.** Record sample type and lab reference interval.
4. **What are the human pH minimum and maximum before death?** There is no single reliable cutoff that predicts death across people and causes. **Status: rejected as a universal threshold.** Do not label 6.8/7.8 as guaranteed fatal limits.
5. **Does healthy blood have separate accepted daytime and nighttime pH ranges?** I found no clinically accepted clock-specific arterial-pH ranges to substitute for the standard interval. Sleep changes ventilation and CO₂ physiology, but the model needs measured longitudinal blood-gas data before assigning a night offset. **Status: open.**
6. **Is there one “inside-cell pH”?** No. Cytosol, lysosomes, mitochondria, and other organelles have different local pH conditions. **Status: observed.** Each compartment requires its own measurement or source-backed range.
7. **Do tumors tend to have an acidic exterior and a neutral/mildly alkaline interior?** This pattern is reported in solid tumors, but magnitude and heterogeneity vary. **Status: observed, not universal.**
8. **Is pH 6.50 the fixed tumor-front floor?** No. Published tumor measurements span ranges and methods; a universal 6.50 boundary is not established. **Status: rejected as a general law.**
9. **Does acidity affect immune cells?** Tumor acidity can impair some immune functions and alter cell behavior, but effects depend on context and are not one binary threshold. **Status: observed in specific experimental settings; threshold model open.**
10. **Does tumor acidity prove a geometric “spoof signal” or wrong-scab mechanism?** No. That is a GRECO analogy/hypothesis; the literature does not validate it as a causal model. **Status: candidate, unverified.**
11. **Can sleeping orientation or gravity be assigned a systemic blood-pH shift?** Not from the evidence reviewed. Posture can affect breathing and clinical physiology in some conditions; any pH effect must be measured, not presumed. **Status: open.**
12. **Can light therapy be modeled as a pH-control input?** Light is a circadian input; that alone does not establish a blood- or tumor-pH effect. **Status: unsupported for pH control.**
13. **Can rotating a patient induce a safe pH or tumor reset?** No supporting evidence was found; it is not a valid treatment assumption. **Status: rejected as an intervention claim.**
14. **What makes up host defense against bacteria and viruses?** Barriers, innate sensing, inflammatory and antiviral signaling, complement and phagocytes, then adaptive antibody and T-cell responses; the mixture varies by pathogen and tissue. pH is one local environmental factor, not the whole defense system. **Status: observed.**
15. **Do bacteria have one pH growth/death threshold?** No. Growth limits differ across species/strains and depend on medium, temperature, nutrients, and exposure time. **Status: rejected as universal.**
16. **Do viruses have one pH death threshold?** No. Stability and infectivity depend on virus, strain, stage, exposure time, temperature, buffer, and assay. **Status: rejected as universal.**
17. **Does a low-pH fusion trigger mean the virus dies at that pH?** No. Entry/fusion activation and environmental inactivation are different endpoints and can move in different directions. **Status: observed distinction.**
18. **Can a virus persist without a host?** Viruses cannot replicate without susceptible host cells, but some virions retain infectivity outside a host for a variable time. “No host” is not automatically “instantly dead.” **Status: observed, virus-specific persistence open.**
19. **Can phages crowd out a human virus or be assumed harmless at any dose?** No. Bacteriophages target bacteria, not human viruses; any clinical use requires phage-specific safety/efficacy evaluation. **Status: rejected as a general strategy.**
20. **What is the safe, falsifiable simulation?** A compartment-specific evidence ledger with pathogen-specific records: organism/strain, host, compartment, pH, temperature, matrix, exposure time, assay endpoint, uncertainty, and source. Run sensitivity analyses on measured ranges. A hypothesis passes only if independent data support its prediction; a failed route becomes a failure receipt. **Status: proposed method.**

## Corrections to prior island artifacts

- `greco_ph_layer_v1.py` assigns every unmeasured record proxy pH 4.5 and applies broad 0–3 / 3–6 / 6–9 zones. Keep this only as a legacy software demonstration; it is not a human physiology default. Use `unknown`/null until an actual compartment-specific measurement is supplied.
- `MD-FREE_CLD_20261003_Gate6...` maps cold skin temperature to pH click 20 and says cold plunges trigger a tumor “Night Switch.” Those are not evidence-backed findings. Reclassify them as **candidate/unvalidated**; do not use them for health decisions.
- `BIO_SIM_GATES_CLD_20261003.md` marks several cross-scale analogies and mechanisms “exact,” “verified,” or “measured.” The evidence reviewed here does not support those labels for the blink/1÷7 mechanism, 147 = 7×21 as a biological control law, “wrong scab” spoofing, or a pH reset. Preserve the original as a historical receipt, but use corrected status labels in future summaries.

## Kill rules and next route

- **P1 kill rule:** If validated, compartment-specific measurements show one shared pH range is adequate across blood, cytosol, organelles, and tumor interstitium, revise the compartment model.
- **P2 kill rule:** If cross-virus data establish a transferable pH-only inactivation threshold despite varying exposure conditions, revise the pathogen-specific model.
- **P3 kill rule:** If controlled biological data show the GRECO coordinate independently predicts a causal switch beyond the raw measurements and known covariates, open a separate mechanistic test. Until then it is an index, not a biological law.
- **Next step:** Build a small source-linked pathogen panel (e.g., selected respiratory viruses plus representative bacteriophages and bacteria), separating (a) pH-triggered entry, (b) infectivity after exposure, and (c) replication/growth. Do not claim an exhaustive “every virus” table without a curated dataset and assay-level sources.

## Source trail

- Merck Manual Professional, Acid-Base Disorders: https://www.merckmanuals.com/professional/nephrology/acid-base-regulation-and-disorders/acid-base-disorders
- NCBI Bookshelf, Arterial Blood Gases: https://www.ncbi.nlm.nih.gov/books/NBK371/
- Zhang et al., “Tumor pH and its measurement,” *Journal of Nuclear Medicine* (2010): https://pmc.ncbi.nlm.nih.gov/articles/PMC4351768/
- Hao et al., “Manipulating extracellular tumour pH,” *RSC Advances* (2018): https://pmc.ncbi.nlm.nih.gov/articles/PMC9081285/
- Review, “Factors affecting virus inactivation in aerosols and droplets” (2024): https://pmc.ncbi.nlm.nih.gov/articles/PMC11285516/
- Review, “Mechanisms of action of microbicides commonly used in infection prevention and control” (2024): https://journals.asm.org/doi/10.1128/mmbr.00205-22
- NIH News in Health, “Fighting Bacteria With Viruses” (2022): https://newsinhealth.nih.gov/2022/08/fighting-bacteria-viruses
- NIH Research Matters, bacteriophage host specificity and therapy overview: https://www.nih.gov/news-events/nih-research-matters/using-viruses-treat-antibiotic-resistant-bacterial-infections
