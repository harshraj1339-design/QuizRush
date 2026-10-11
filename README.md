# QuizRush

**Revise Fast. Score High.** QuizRush is a responsive Semester 3 exam-preparation app with six subjects, unit selection, timed 25-question practice, immediate answer explanations, answer review, and quiz history.

## Technology

React, TypeScript, Vite, Tailwind CSS, Lucide icons, and Supabase for the student registry and protected administrator directory.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the Supabase project URL and publishable/anon key from your Supabase project's API settings:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

These are public frontend configuration values. Never put a Supabase service-role key in a `VITE_*` variable or commit secrets.

## Configure Supabase

1. Create or open your Supabase project.
2. Open **SQL Editor** and run `supabase/migrations/20261010000100_quizrush_student_registry.sql`.
3. Run `supabase/migrations/20261011000100_student_login_events.sql` to create the repeat-entry history table.
4. Copy the Project URL and publishable/anon key into `.env.local`.
5. In **Authentication → Users**, create an administrator account with email and password.
6. Copy that user's UUID, then run this SQL in the SQL Editor, replacing the placeholder with the actual UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('REPLACE_WITH_ADMIN_AUTH_USER_UUID');
   ```

7. Add the same two frontend environment variables to your hosting provider and redeploy.

The admin dashboard is available at `/#/admin`. It uses Supabase Auth and checks the `admin_users` table. Row Level Security protects student directory reads; ordinary visitors can register a profile but cannot list student records. Keep the `admin_users` table restricted to authorized administrator records.

**Registration ID only is not identity verification.** The current onboarding is not a student login, and anyone may submit a name and registration ID. Do not use this approach for sensitive identity verification or access to private student-specific records.

## Data and current limitations

- Student name, registration ID, semester, and registration timestamp are stored in Supabase.
- Duplicate registration IDs are rejected by the database unique constraint.
- Admins can search and view up to 500 student records and review the 1,000 most recent entry events. Every successful onboarding submission is logged separately, including repeat visits using the same registration ID.
- Quiz sessions, completed attempts, and history currently remain in browser storage. They are not yet linked to the student registry or synced between devices.
- The app contains 150 original demo questions: 25 per subject. These are not the planned 100-question-per-subject verified release.
- Syllabus titles and unit assignments remain provisional until the official course documents are reviewed.

## Before release

Run `npm install` and `npm run build`, then test onboarding, duplicate registration handling, admin sign-in/sign-out, and denied student-directory access for non-admin users. Do not deploy until the build passes and the SQL migration has been applied.
