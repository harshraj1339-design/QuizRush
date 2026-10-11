# QuizRush question-bank quality review

Status: **NOT APPROVED FOR PUBLIC RELEASE**. This is a structural/content-pattern audit, not subject-matter-expert sign-off.

## Current structural findings

| Subject | Entries | Unit counts | Current finding |
|---|---:|---|---|
| CSE205 — Data Structures and Algorithms | 450 | I–III: 100 each; IV–VI: 50 each | Target count restored. Six duplicate stems detected; answers, explanations, and syllabus alignment still need verification. |
| CSE202 — Object Oriented Programming | 450 | I–III: 100 each; IV–VI: 50 each | No exact duplicate stems detected in the latest structural scan. Answer keys, explanations, and syllabus alignment still need verification. |
| CSE306 — Computer Networks | 600 | 100 per unit | Tuple structure and answer-key placement repaired. Only 60 unique stems remain across 600 rows (540 repeated stems), and generic filler distractors remain. **Not publishable.** |
| CSE423 — Virtualization and Cloud Computing | 600 | 100 per unit | Repeated template stems remain. A generic filler distractor was replaced with a same-unit subject-related alternative, but all options/keys still need substantive review. |
| MTH401 — Discrete Mathematics | 600 | 100 per unit | Repeated template stems remain. A generic filler distractor was replaced with a same-unit subject-related alternative; mathematical keys and explanations still need verification. |
| INT335 — Design Thinking | 600 | 100 per unit | Template repetition remains; the unit grouping is provisional because the official INT335 syllabus has not yet been confirmed. |

## CI status

The latest GitHub Actions run for commit `62d25bde9ce3c83502db7c78335344a9f0b90549` completed successfully, including the application build. The workflow currently uses `npm install --no-audit --no-fund` because `npm ci` previously reported that `package.json` and `package-lock.json` were out of sync. The successful build validates compilation at this commit; it does not prove question correctness or replace the need to synchronize and commit the lockfile.

## Latest validation\n\n- GitHub Actions run 32: **success** (dependency installation and application build both passed).\n- CSE306 structural scan: 600 rows, 100 per unit, 60 unique stems; the stem duplication is still a critical release blocker.\n- CSE205 structural scan: 450 rows, target unit counts met, 444 unique stems; duplicated stems remain.\n- CSE202 structural scan: 450 rows, target unit counts met, 450 unique stems. This is a structural result only, not answer-key verification.\n- CSE423, MTH401, and INT335 each have 600 rows and 600 distinct stems in a simple exact-stem scan; template similarity and factual correctness still require deeper review.\n\n## Corrections recorded

- CSE205 restored to 450 entries with the intended unit counts.
- CSE306 tuple layout and answer-key placement repaired and generic filler distractors replaced; its 540 duplicate stems and unverified distractor plausibility remain release blockers.
- CSE423 and MTH401 repeated unrelated filler distractors replaced with subject-related alternatives.
- CI dependency-install step adjusted to get past the lockfile mismatch.
- All changes remain on `feature/supabase-backend`; no changes were merged into `main`.

## Release blockers

1. Rewrite CSE306 repeated templates into genuinely distinct questions, assess distractor plausibility, and verify answer keys and explanations.
2. Review CSE205 and CSE202 answer keys/explanations against the official syllabi and remove duplicate/ambiguous items.
3. Rewrite template-heavy CSE423, MTH401, and INT335 items with plausible distractors and accurate explanations.
4. Confirm every unit assignment against official course syllabi; INT335 unit mapping remains provisional.
5. Run a structural audit, clean install/build, and human subject-matter spot check before release.

## Quality standard

A target entry count or unique stem count alone does not demonstrate quality. Each question needs one defensible answer, plausible non-overlapping distractors, an explanation that supports the key, and alignment to the intended unit. See:
- https://teaching-resources.delta.ncsu.edu/multiplechoice/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC9873868/
