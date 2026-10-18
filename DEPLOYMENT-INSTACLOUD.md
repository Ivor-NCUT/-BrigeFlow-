# Paused runtime migration

The source project was already suspended and its last Zeabur deployment of
`bef08b50142981e893e5216c4294c06dee7878b1` failed. This migration preserves that
source and its existing InsForge PostgreSQL/auth configuration. There is no
Zeabur data volume to restore. Do not recreate the external database or run
migration/seed scripts.

## Build and runtime

1. Install the lockfile dependencies with Node 24: `npm ci`.
2. Supply the existing public `VITE_INSFORGE_PROJECT_URL` and
   `VITE_INSFORGE_ANON_KEY` to `npm run build`. Never put `DATABASE_URL` or
   private service keys in frontend build variables.
3. Build the runtime container: `docker build -t bridgeflow .`. Its `dist`
   directory is the output of step 2; do not omit it from the build context.
4. Bind the existing `DATABASE_URL`, InsForge URL and anon key only to the
   target compute service. Runtime defaults to port 3001.

Production API calls now default to relative URLs, so the UI and API served
by this container use the same origin. `VITE_API_BASE_URL` still overrides
this default; local development still defaults to `http://localhost:3001`.

## Preserve the original pause

Use InstaCloud service port `0` for internal verification with no public HTTP
endpoint. Read `/api/health` (SELECT 1 only), check homepage/assets and the
unauthenticated API response. Do not create users or write real contacts.
Stop the target after acceptance and read back its suspended state. Keep
the source suspended, its data/configuration, and its DNS unchanged.

The original auth middleware includes an unverified JWT fallback on SDK
failure. This migration does not validate that mechanism as secure and must
not publicly reactivate the application. Actual user login, authorized data
operations, and any future public rollout require separate validation and
removal of that fallback. The target being built is not proof of a complete
business migration if the external database is unavailable.

Regression check: `node scripts/test-api-origin.mjs` bundles the real API module
with a synthetic session provider and verifies production same-origin, local
 development, and explicit endpoint selection without network or user data.

## Self-hosted services (Issue #3)

The `selfhost` compute service replaces the hosted InsForge client with same-origin login, profile, avatar and session endpoints. PostgreSQL runs as `postgresql` inside the same InstaCloud project; avatar bytes persist at `/data/avatars`. Both services use port 0 during migration acceptance. The previous `app` and original Zeabur service remain stopped.

`backend/selfhost-schema.sql` initializes a NEW empty business database once. Never run it over an existing database or claim an empty schema contains recovered production data. Original repository SQLite data is retained in a separate `migration_archive.sqlite_snapshots` JSONB record, with original file SHA and per-table counts. It has no auth records and two owner identifiers; linking those identities to login accounts requires verified ownership. Do not infer ownership from an email supplied at signup.

Accounts are operator-provisioned through `scripts/provision-user.ts` (email/password JSON on stdin, not arguments). Public signup/email-verification is intentionally unavailable until an authorized mail channel or account policy is established. Existing InsForge sessions/passwords are not migrated. Passwords use salted scrypt, opaque random sessions are stored hashed in PostgreSQL, expire after seven days and are revoked on logout; no unsigned JWT fallback. Login attempts are throttled by email hash. Avatars accept bounded PNG/JPEG/WebP uploads, random names, no SVG.

Validation: run `node node_modules/tsx/dist/cli.mjs scripts/test-selfhost.ts` inside the isolated app. It uses temporary synthetic accounts and removes its records/files in `finally`. Production users, notifications, account recovery mail and original consumers are not enabled. Full historical database completeness remains unverified until a source dump is available.

Validation also uses `scripts/test-persistence.ts stage` before a controlled restart and the same script without `stage` after restart. It compares a synthetic volume marker to its database digest and removes both. It never changes archived historical data.

The frontend production bundle and three API-origin regression cases pass. Full frontend typechecking still reports six pre-existing domain-model/import-progress errors outside this migration; it is not claimed green. Hosted production user credentials and any later hosted-only records remain unavailable. Repository SQLite rows are archived separately without assigning ownership to new accounts. No production activation or outbound verification emails are performed.
