# Vercel deployment

The app runs on Next.js App Router and Node.js functions. The merged chat layout, CSS, typography, icons, and interactions are preserved. Changes inside `app/workspace.tsx` only connect sign-in and direct file upload to the new hosting services.

## Required services

Use a dedicated Supabase project for the app's PostgreSQL database, authentication, and private files. The old Sites-managed D1, R2, and ChatGPT identity headers are unavailable on Vercel. Those request headers are deliberately ignored; accepting them on a public host would allow impersonation.

The one user-facing hosting change is email-link sign-in instead of the Sites ChatGPT sign-in page. The chat interface's existing **Đăng nhập** button opens this sign-in page. Only verified addresses listed in `MORA_ALLOWED_EMAILS` can access the workspace. Add coworkers there before inviting them. Supabase email delivery must be configured for the intended recipients; its default sender can restrict delivery to your Supabase team. Configure custom SMTP for other coworkers.

In Vercel, connect the dedicated Supabase integration to the `mora` project, then verify these server and public variables exist:

- `POSTGRES_URL` (or `DATABASE_URL`): Supabase pooler connection string, with TLS enabled. Transaction pooling is supported; prepared statements are disabled.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`: server only, never `NEXT_PUBLIC_`.
- `MORA_ALLOWED_EMAILS`: comma-separated addresses; no wildcard or open-registration fallback.
- `OPENAI_API_KEY` and optional `OPENAI_MODEL`: optional, as before. Missing AI credentials produce the existing honest unavailable message.

Set Supabase Auth's site URL to the production domain, and allow the exact `/auth/callback` URL. Email links must open in the browser that requested them (PKCE). Add explicit callback URLs for any intended previews, using a separate Supabase project and separate environment values. Do not connect unreviewed previews to production data.

`pnpm vercel-build` fails before publishing if required configuration is absent. It runs the PostgreSQL behavioral tests, applies checksum-verified migrations under a transaction/advisory lock, verifies or creates a private 5 MB file bucket, then builds Next.js. Database tables live in the private `mora` schema, have RLS enabled, and are accessed only through authenticated Next.js routes. The Supabase public Data API is not used for workspace data.

## Automatic deployment

The Vercel project is connected to `nguynking/mora`. With `main` selected as the Production Branch, each pushed/merged commit on `main` builds and deploys automatically; other branches create previews when their environment is configured. No Vercel token or deploy hook belongs in GitHub.

`.github/workflows/ci.yml` runs lint, PostgreSQL integration checks, a Next.js production build, and the rendered-shell regression on pull requests and pushes to `main`. The Vercel build also runs behavioral tests before migrations or publication, so failing behavior tests block deployment without depending on optional GitHub protection settings.

## Existing data and cutover

Changing hosting does **not** transfer the existing Sites database or R2 files. Keep the old deployment intact until an export is available and import/verification is complete. Do not describe a newly provisioned workspace as migrated history.

The PostgreSQL schema preserves existing entity IDs, relationships, room membership, timestamps, and text fields. Historical D1 migrations are retained under `drizzle/`; the PostgreSQL equivalent is under `db/postgres/`. An import must copy members, rooms, bots, contexts, messages, tasks, reactions, room_members, bot_replies, and file metadata in dependency order, and copy each R2 object to the private `mora-files` bucket under its original file ID. Verify counts and file checksums before cutover. Verified email ownership maps existing member IDs to the new sign-in session, preserving private-chat membership. Duplicate legacy email rows deliberately block login until reconciled.

## Upload behavior

The existing picker, progress state, 5 MB limit, chat message, and download interaction remain. File bytes go directly to a signed path in private storage because they exceed Vercel's request-body limit. Next.js checks membership before issuing the upload token and again before publishing the message. Completion checks owner, expiry, object existence, and actual size. Retries publish one message. Downloads require room access and return a private, 60-second download link. These bearer links must not be logged or shared. Abandoned uploads can be removed after their two-hour expiry; retain objects referenced by `files`.

## Validation limits

The automated integration suite executes real PostgreSQL SQL in PGlite, with request-isolated authentication and storage service doubles. It covers the existing collaboration workflows plus forged identity headers, rollback, file ownership, 5 MB boundaries, expiry, and duplicate completion. It does not substitute for a live Supabase email sign-in, storage upload/download, and multi-user acceptance check after provisioning.
