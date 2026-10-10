# QuizRush

**Revise Fast. Score High.** QuizRush is a responsive Semester 3 exam-preparation demo with a personalized workspace, subject and unit selection, timed 25-question practice, immediate answer explanations, answer review, and attempt history.

## Technology

React 19, TypeScript, Vite, Tailwind CSS 4, Lucide icons, Netlify Functions, and Netlify Database with Drizzle ORM. The frontend is a plain Vite application rather than an SSR template, keeping browser-only student sessions straightforward and the frontend portable.

## Run locally

```sh
npm install
npm run dev
```

The Vite frontend works without paid APIs, AI keys, or a database connection string. A browser copy of attempts remains usable if anonymous server storage is unavailable. To emulate Netlify Functions and database integration, use the existing Netlify CLI with the linked project:

```sh
netlify dev --port 8889
```

Production compilation is configured through `npm run build`; Netlify publishes `dist`. These commands are instructions for local development and were not executed during implementation. The platform's build pipeline performs deployment validation automatically.

## Demo content and missing course documents

The application contains 150 original demo questions: 25 for each of CSE205, CSE202, CSE306, CSE423, MTH401, and INT335. These are a deliberately limited sample bank, not the planned 100-question-per-subject verified release.

No syllabus PDFs or sample examination papers were available in the workspace. The user indicated that they would supply them. Accordingly, units are labeled I–VI with **syllabus verification pending**, and their question assignments are explicitly provisional. Demo topic lists describe the questions, not an asserted university syllabus. No syllabus titles or boundaries were represented as verified.

With the current bank, selecting all six units provides the 25 unique questions required to start a quiz. Smaller selections display the actual eligible count and cannot start until at least 25 questions exist. Questions and options are shuffled without changing stable correct-option identifiers. New questions are never generated at runtime.

When the documents become available:

1. Update the subject's unit titles and topics in `src/data/subjects.ts` using the exact syllabus, and set `verified: true` only after checking the documents.
2. Remap existing demo question units to the real boundaries or replace them with verified original questions.
3. Expand the appropriate subject file in `src/data/questions/`, keeping stable IDs, exactly four options, valid correct-option IDs, explanations, difficulty, and style metadata.
4. Run the exported `validateQuestionBank` utility in your development workflow. The application also validates its bank before quiz creation.

The seed helper's first option is the canonical correct answer. It becomes a stable `a` option ID, and visible option order is randomized for each quiz. Write explanations in terms of answer content, not displayed letters.

## Privacy and persistence

There is no login, password, or authentication claim. Student names and registration numbers are stored **only in browser localStorage**, as requested in the user's clarification. Personal details are never included in the attempt API payload or database schema.

Completed attempts are cached in the browser and saved to Netlify Database as anonymous question/answer snapshots. Each local registration profile has a randomly generated device key; only a hash of this key is stored on the server. This key is a demo history capability, not secure university authentication. Quiz scores are recalculated server-side from canonical question IDs and answer IDs. Completed snapshots preserve explanations for future reviews.

An active session stores its shuffled questions, locked answers, position, and absolute start time in the browser. Refreshing restores that session and its remaining timer. Timer expiry uses the same guarded submission path as manual submission. Duplicate saves are idempotent by attempt ID. Storage failures have visible notices and anonymous-save retry controls in Quiz History.

Clearing browser data removes the personal profile, cached attempts, and history key; data does not automatically transfer to other devices. Restarting onboarding clears only the current profile and keeps completed attempts and keys. Entering the same registration number retrieves its previous local history.

## Structure

- `src/components/`: onboarding, shell, dashboard, setup, quiz, results, review, history, and profile views.
- `src/data/subjects.ts`: exact subject metadata and syllabus verification status.
- `src/data/questions/`: original, typed, subject-specific demo banks.
- `src/services/quiz.ts`: validation, filtering, unique shuffling, scoring, and timer formatting.
- `src/services/storage.ts`: guarded browser storage and anonymous attempt API access.
- `src/styles.css`: shared design tokens, light/dark themes, illustration, and responsive layouts.
- `db/schema.ts`: anonymous persistence schema; `db/index.ts`: Netlify Database adapter.
- `netlify/functions/attempts.mts`: bounded, validated, anonymous history endpoint.
- `netlify/database/migrations/`: generated Drizzle migration, applied by Netlify.

After changing `db/schema.ts`, generate a migration with `npm run db:generate -- --name describe_the_change`. Never edit generated migration SQL by hand.

## Manual acceptance checklist

No dev server, build, typecheck, or browser test was run in this session because project execution rules reserve validation for the deployment pipeline. Source and dependency signatures were reviewed. After deployment, verify:

- First visit shows onboarding; blank/whitespace inputs produce inline errors; valid details save and survive refresh.
- Semester 3 is the only selectable semester; the dashboard uses actual attempt data and correct empty states.
- Each subject accepts a unit count and exactly that many distinct units, including nonconsecutive selections.
- Fewer than 25 eligible questions prevents starting; all six units produce exactly 25 unique questions.
- Correct/incorrect answers reveal accessible green/red states and immediate explanations, remain locked, and persist across navigation.
- Previous, Next, number navigation, skip-and-return, submit confirmation, and exit confirmation all behave correctly.
- An 18-correct, 5-incorrect, 2-unanswered attempt produces 18/25, 72% overall accuracy, and those exact donut segments.
- All-correct, all-incorrect, and all-unanswered attempts have correct scores and segments.
- A one-minute timer expires through the same submission path; refreshed sessions use the original deadline.
- Results, complete answer review, repeat-unit practice, and subject/dashboard actions work; completed history survives refresh.
- Changing profile registration separates histories; anonymous request payloads do not contain name or registration.
- Light/dark themes, keyboard focus, dialog handling, and 320px–1440px responsive layouts are readable without horizontal overflow.

## Deployment portability

The React frontend can be deployed on Netlify or a static Vercel deployment. Netlify Functions and Netlify Database are platform-specific; a Vercel deployment retains the explicitly disclosed browser demo fallback unless an equivalent anonymous history service is implemented. No database credentials or external configuration are required for this linked Netlify project.
