# Secure student sign-in and cloud progress setup

QuizRush uses Supabase email OTP verification. A registration number is profile information only; it is not a password or proof of identity.

## Required one-time Supabase setup

1. Open the Supabase project used by QuizRush.
2. Open **SQL Editor** and run the complete migration file:
   `supabase/migrations/20261012000100_authenticated_student_progress.sql`.
3. In **Authentication → Providers → Email**, enable email sign-in.
4. In **Authentication → Email Templates**, configure the sign-in OTP email to display the token using `{{ .Token }}`. The app asks students to enter the six-digit code.
5. In **Authentication → Rate Limits**, retain sensible limits for email OTP requests. Configure SMTP for production deliverability if the project's default email service is insufficient.
6. Ensure the deployed site and local development origin are allowed by the project's authentication URL/site URL settings.
7. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the local `.env.local` and the deployment provider's environment variables. Use the publishable/anon key only; never put a service-role key in the browser.

## What syncs

After email verification, a profile is associated with the authenticated Supabase user ID. Row-level security policies scope profile, quiz attempts, unfinished quiz session, question usage, and bookmarks to `auth.uid()`.

- Completed attempts are written to `public.quiz_attempts`.
- Current quiz answers and question index are written to `public.quiz_progress.active_session`.
- Previously used question IDs and bookmarked question IDs are written to `public.quiz_progress`.
- The app restores these records after a verified user signs in on another device.

The first successful verified sign-in creates the profile. A registration number already linked to a different verified account cannot be claimed by simply entering that number.

## Before release

Run `npm ci`, `npm run build`, and test: request OTP, verify it, complete a quiz, refresh, sign out/in, then sign in on a second browser/device. Confirm that one account cannot read another account's rows. If a migration or environment variable is missing, cloud saves will fail rather than making registration IDs an authentication shortcut.
