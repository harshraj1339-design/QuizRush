# QuizRush development guide

## Architecture

This is a plain React/TypeScript/Vite SPA. `src/App.tsx` coordinates a small hash-based router, browser-only student profile, active quiz, anonymous attempt synchronization, and theme. The plain Vite structure intentionally avoids SSR because student sessions use browser APIs. Keep existing component boundaries rather than moving quiz data into views.

`src/components/` contains reusable brand and common components plus each application view. `src/data/subjects.ts` is the single source for subject names and course codes. `src/data/questions/` contains subject-specific original demo seeds; `helpers.ts` normalizes them to typed questions. `src/services/quiz.ts` owns validation and pure scoring. `src/services/storage.ts` owns all persistence boundaries. `src/types.ts` defines shared models.

`db/schema.ts` defines anonymous attempt records with Drizzle. `db/index.ts` initializes the Netlify adapter lazily. `netlify/functions/attempts.mts` validates input, looks up canonical questions, recalculates results, and saves only whitelisted anonymous fields. Migrations are generated into `netlify/database/migrations/`.

## Non-obvious requirements

- Never send student names or registration numbers to the backend. They are browser-only by explicit user choice.
- The random browser device key is a demo history capability, not secure authentication. Do not add fake login UI.
- All six prescribed subjects have exactly 25 sample questions. Smaller selections must fail gracefully when fewer than 25 unique eligible questions exist.
- No syllabus PDFs or sample papers were supplied. Unit labels are I–VI, and assignments are explicitly provisional. Replace titles, topics, and assignments only from actual provided documents; do not fabricate verified syllabus structure.
- Answer IDs remain stable when option order changes. Feedback locks the answer immediately, and scoring never treats unanswered questions as correct.
- Result accuracy is correct answers divided by all 25 questions. The chart separately includes correct, incorrect, and unanswered counts.
- Use the same guarded submission path for manual completion and timer expiry. Persist absolute start time rather than a decrementing timer value.
- Anonymous synchronization must preserve browser snapshots and successfully saved state. Do not discard browser history when the backend is unavailable.
- Restart onboarding preserves completed attempts and local device keys. Changing registration selects that local profile's separate history.

## Conventions

Use TypeScript, named domain types, Lucide icons, reusable components, CSS design tokens, and Tailwind integration. Prefer focused edits. Use stable IDs and detailed explanation text for all questions. Do not add inline code comments, runtime question generation, paid APIs, or unsupported authentication claims. Respect reduced-motion preferences and keep light/dark responsive surfaces consistent.

Import server-side TypeScript modules with `.js` extensions. Use `.mts` for Netlify Functions. Never leak device keys or personal details into logs. Define persistent structured records through Netlify Database, and generate a named Drizzle migration whenever the schema changes. Do not edit migration SQL or snapshot JSON manually.

## Development

`npm run dev` runs the frontend. `netlify dev --port 8889` also emulates server functions for this linked project. `npm run build` typechecks and compiles in the platform build pipeline. `npm run db:generate -- --name change_description` generates migrations.

The original implementation environment prohibited local build, dev-server, typecheck, and test execution; validation was left to the automatic pipeline, and this limitation was recorded in the README and delivery summary. Follow current task instructions concerning command execution. See the README's acceptance checklist for browser-level verification.
