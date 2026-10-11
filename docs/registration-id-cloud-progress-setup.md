# Registration-ID-only cloud progress setup

This implementation syncs quiz attempts, an unfinished session, question usage, and bookmarks through Supabase RPCs keyed by the 8-digit registration ID. Email verification is not used.

## Apply the database migration

1. Open the QuizRush Supabase project.
2. Open **SQL Editor → New query**.
3. Open `supabase/migrations/20261012000300_registration_id_cloud_progress.sql` from this repository.
4. Copy the entire file into SQL Editor and click **Run**.
5. Confirm the query succeeds. It creates `registration_student_data` and the RPCs `get_registration_student_data` and `save_registration_student_data`.

This migration intentionally does not expose direct table access to the browser. The browser calls security-definer RPCs, which validate the registration ID format.

## Configure and run locally

1. Ensure the project root `.env` contains the Supabase project URL and anon/publishable key:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
   ```
2. Pull the latest `main` branch and run:
   ```powershell
   git pull origin main
   npm ci
   npm run build
   npm run dev
   ```
3. Open QuizRush, enter the same 8-digit registration ID and name, finish a short quiz, and add a bookmark.
4. Open a private window or a different browser, use the same registration ID, and confirm history/progress/bookmarks load from Supabase.
5. In Supabase Table Editor, check `registration_student_data` for the row. The table has no direct anon/authenticated table grants; the app accesses it through the RPCs.

## Deploy

After the local test and successful build, push/deploy the latest `main` branch through your normal hosting workflow. Ensure the hosting provider has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured and trigger a fresh build. Environment variables are embedded into the frontend at build time.

## Security limitations — read before production

Registration ID alone is an identifier, not proof that a person owns that ID. These RPCs are callable by anonymous visitors because the requested flow has no email verification or other credential. Anyone who knows or guesses an 8-digit registration ID may read or overwrite that student's cloud progress. Input validation, RLS on the underlying table, and hiding direct table grants do not solve that impersonation risk because the RPC intentionally permits ID-only access.

Use this version only if you accept that limitation. Do not store sensitive personal information in this table. A secure production system needs an additional credential or trusted verification. The app merges local and cloud attempts by attempt ID; concurrent changes to the same unfinished quiz from multiple browsers can still conflict, so avoid editing the same active quiz simultaneously.

## Current scope

The cloud record stores completed attempts, one active quiz session, question-usage history, and bookmarks. Theme preference and transient UI state remain local. Existing records from other local browsers are not automatically imported unless those records are present in the browser that first initializes the cloud record.
