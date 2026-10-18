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
