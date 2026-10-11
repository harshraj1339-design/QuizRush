# QuizRush question-bank quality review

Status: **NOT APPROVED FOR PUBLIC RELEASE**. This review is based on a structural scan of the current feature branch and available course materials. It is not a subject-matter expert sign-off.

## Findings from the scan

| Subject | Current entries detected | Unit counts | Review status |
|---|---:|---|---|
| CSE205 — Data Structures and Algorithms | 25 | I: 5, II: 4, III: 4, IV: 5, V: 3, VI: 4 | **Incomplete** versus the planned 450 entries. |
| CSE202 — Object Oriented Programming | 450 | 100, 100, 100, 50, 50, 50 | Structure looks consistent; still requires answer/explanation verification against the syllabus. |
| CSE306 — Computer Networks | 600 | 100 per unit | **Critical schema/content defect.** Rows store the actual question in the answer-key field, shift the choices, and omit explanations. Do not serve this bank until reconstructed and every key is checked. |
| CSE423 — Virtualization and Cloud Computing | 600 | 100 per unit | Removed the repeated obviously unrelated distractor; alternatives now draw from neighboring concepts. Still has repeated template stems and needs syllabus/sample-paper review. |
| MTH401 — Discrete Mathematics | 600 | 100 per unit | Removed the repeated obviously unrelated distractor; alternatives now draw from neighboring concepts. Still has repeated template stems and needs mathematical answer-key verification. |
| INT335 — Design Thinking | 600 | 100 per unit | Many concepts repeat the same answer and distractors across templated stems. Requires a substantial rewrite against the official INT335 syllabus before approval. |

## Corrections made in this pass

- Replaced the identical filler distractor in all 600 CSE423 entries with a subject-related alternative drawn from another concept in the same unit.
- Replaced the identical filler distractor in all 600 MTH401 entries the same way.
- Kept all changes on `feature/supabase-backend`; nothing was merged into `main`.

## Blocking work before publication

1. Rebuild CSE306 seed tuples so each record has a real stem, four options, a verified correct answer, and an explanation. Then check all 600 answer keys.
2. Restore/author the planned CSE205 bank; only 25 records are present in the current file, not 450.
3. Rewrite template-heavy CSE423, MTH401, and INT335 items into genuinely distinct questions, with plausible same-category distractors and accurate explanations.
4. Verify all subject unit assignments against the official syllabus and use sample papers only as a style guide, not as a source to copy.
5. Run TypeScript/build checks and a bank audit; then have a human subject reviewer spot-check factual accuracy and ambiguity.

## Quality standard

A unique stem count alone does not demonstrate quality. Each question needs one defensible answer, plausible non-overlapping distractors, an explanation that supports the key, and alignment to the intended unit. These criteria follow standard MCQ construction guidance, including the NC State teaching resource and the peer-reviewed MCQ development blueprint:
- https://teaching-resources.delta.ncsu.edu/multiplechoice/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9873868/
