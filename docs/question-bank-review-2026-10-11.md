# QuizRush question-bank release review — 2026-10-11

## Decision

**CSE423, MTH401, and INT335 are NOT approved for publication.** The TypeScript files compile and have 600 rows each, but row count and unique literal stems do not establish correct answer keys, useful distractors, or official syllabus coverage. Keep the release gate closed until the listed content issues are corrected and the audit passes.

## CSE423 — Virtualization and Cloud Computing

- **Syllabus alignment: unverified.** A matching official CSE423 syllabus/sample paper was not located in the available course documents during this review. The current six-unit topic map is therefore provisional; do not label it syllabus-verified.
- **Answer-key/distractor risk: high.** The same concept answer is repeated across sets of ten stems, while an additional correct or near-correct statement appears as another option. For example, virtualization items use “Virtualization creates software-based representations…” as the key and also offer “A hypervisor creates and manages virtual machines…” as an option; both statements can be true. This makes single-answer grading ambiguous.
- **Editorial quality: fail.** The bank uses a repeated ten-stem wording cycle (“Which statement…”, “Which description…”, “A student is reviewing…”, etc.) and repeated option sets, rather than 600 independent questions. Explanations frequently repeat an incorrect distractor rather than explain why the key is correct.
- **Required before approval:** obtain the official CSE423 syllabus/sample paper; map every question to its unit/topic; rewrite template batches into scenario/calculation/application questions; ensure exactly one defensible key per item; add key-focused explanations; verify all options.

## MTH401 — Discrete Mathematics

- **Syllabus alignment: partial, not approved.** The official 2026–27 MTH401 syllabus was found. The broad six-unit structure matches: Unit I logic/proofs; Unit II recurrence relations; Unit III counting/relations; Unit IV graph theory I; Unit V graph theory II/trees; Unit VI number theory/cryptography. However, topic coverage is incomplete or uneven. Examples of syllabus topics that need explicit coverage checks include vacuous/trivial proofs and proof mistakes; recurrence modelling, inverse-operator solutions and generating functions; lattices/sublattices; incidence matrices, wheel/cube graphs and digraph connectivity; Euler formula and infix/prefix/postfix notation; LCM, Chinese remainder theorem, affine transformation and Fermat’s little theorem.
- **Answer-key/distractor risk: high.** In the Unit IV “complete graph” set, one distractor states a true definition of a bipartite graph. That is not the same as the key, but repeated sets and broadly related options increase ambiguity; every item still needs individual verification. Several items repeat the same key and same distractor group across ten differently worded stems.
- **Editorial quality: fail.** The bank has 600 unique literal stems, but the stem pattern cycles in groups of ten, and some numerical/algorithmic topics need worked verification rather than template repetition.
- **Required before approval:** audit every answer against definitions/calculations, independently recompute numerical answers, replace repeated variants with varied proof, recurrence, counting, graph and modular-arithmetic problems, and close syllabus gaps above.

## INT335 — Design Thinking

- **Syllabus alignment: fail.** The official 2026–27 INT335 syllabus was found. The current unit map is shifted/misaligned in material ways. Unit I should include focused/diffuse modes, VARK, functional fixedness, creativity/invention/innovation, history, Stanford d.school and IDEO frameworks, and case studies; the current bank instead starts with generic human-centered design, desirability, feasibility and viability. Unit VI should focus on iteration/redesign, pivoting, NABC, elevator pitches and final project presentation; the current Unit VI is primarily usability-testing metrics and facilitation, which belong more naturally to Unit V.
- **Answer-key risk: moderate to high.** Many keys are short phrases rather than precise answer statements, and the same key/explanation is reused across twelve differently worded items for several topics. Those can be valid definitions, but they do not demonstrate a sound single-best-answer key for each stem.
- **Editorial quality: fail.** The literal stems vary, but repeated template patterns and recurring answer/explanation pairs mean the bank is not yet a robust 600-question practice set.
- **Required before approval:** remap all questions to the exact six syllabus units, add missing named syllabus concepts and cases, move usability testing/customer journey/accessibility to Unit V, and add iteration/NABC/pitch/project questions to Unit VI; review every key and distractor.

## Final audit and build status

- Structural inventory: 600 rows per bank; 600 distinct literal stems per bank; 100 rows in each of six units.
- These counts are **not** a content-quality pass. The repeated stem templates, repeated keys/options, ambiguous single-answer items and syllabus gaps above are release blockers.
- The GitHub Actions build for the latest CSE205 repair commit completed successfully. This verifies TypeScript/Vite build only; it does not validate answer correctness.
- The current question-bank audit script is structural and does not prove factual correctness or official syllabus alignment.
- **Publication decision: hold.** Do not merge PR #2 or publish these three banks as approved until the content issues are fixed and a fresh audit/build passes. No publication was performed as part of this review.
