# Backend V1 review and manual staging gate

This is Game Admin metadata only. No hosted migration or deployment was executed by this sprint.

## Baseline and additions

Retain the real ACTIVE profile + ADMIN membership guard and existing migrations 001–010. There are no preexisting Library, analysis, blueprint or draft territory tables. Migration 011 adds `game_backend_records` (typed metadata with organization ownership, source linkage, review lifecycle and optimistic versions) and the private `game-backend` Storage bucket. It does not alter existing game/Auth/result tables, formulas or canonical content.

## Manual staging sequence

1. HUMAN_REVIEW: Confirm the target is the disposable Game staging project. Follow `V1_STAGING_RUNBOOK.md` for 001–010 and real Auth/profile linkage; never run the development seed on hosted projects.
2. HUMAN_REVIEW: Inspect migration 011 and existing Storage policies. Existing permissive Storage policies are OR-combined and must not expose this bucket. Check for bucket/policy name collisions before applying. Do not apply automatically or rerun a partially applied migration.
3. HUMAN_REVIEW: Apply `011_backend_workspace.sql` once, after 010, using the project SQL editor. Its transaction must commit completely. No new environment variables or browser service-role key are required.
4. SAFE_TO_RUN: Inspect `pg_policies` for `game_backend_records` and `storage.objects`; inspect `storage.buckets` where id = 'game-backend'. The `public` column must be false, file_size_limit=10485760 and the six declared MIME types must be present. No anonymous backend grants are permitted.
5. HUMAN_REVIEW: With a real ACTIVE ADMIN, open Landing → Staff → Admin. Create a draft document, upload a small PDF, save the attachment reference, refresh, edit using another browser, and confirm stale-version rejection. Verify private download using the Supabase Storage API with the Admin session.
6. HUMAN_REVIEW: Verify a student, assigned teacher, unassigned teacher, anonymous caller and other-organization Admin cannot read/write these records or private objects. PUBLIC visibility must still be inaccessible to these callers. Verify disabled Admin and revoked ADMIN membership lose access on the next query.
7. HUMAN_REVIEW: Verify DRAFT → REVIEW → APPROVED → PUBLISHED; skip transitions must fail. Approved content edits must require DRAFT. Archive replaces deletion. Create from Arctic must create only a metadata draft and leave game execution unchanged.
8. SAFE_TO_RUN: Locally run `npm run build`, `npx tsx src/tests/backend-workspace.test.ts`, `npx tsx src/tests/admin-entry.test.ts`, `npm run test:auth`, `npm run test:acceptance`, `npm run test:frozen`, `npm run test:progress-reports`, `npm run test:campaign`, and `npm run test:rls`.

## Enabled and deferred operations

Enabled after manual staging setup: Admin-only metadata create/edit/review/archive; private immutable file upload; source links; manual classification/blueprint/Question Set JSON editing; draft territory references and visual slots; verified-evidence analytics/exports; profile display name and ACTIVE/DISABLED status edits (self edit blocked).

Deferred: canonical identity importer, CSV/manual Auth provisioning, password set/reset, role/classroom assignment changes. These require a trusted server management API that validates caller ADMIN membership, validates target organization and canonical-ID duplicates, prevents privilege escalation/last-admin lockout, records an audit event and makes coordinated Auth/profile changes safely. Existing-system import also needs a reviewed connector. No passwords are read or written by this console.

Deferred: territory runtime publishing, canonical question-map validation, full visual editor, AI generation, public/teacher Library readers, storage malware scanning, abandoned-upload cleanup, full version history and administrative audit log. Version numbers currently provide concurrency control, not recoverable historical snapshots. Uploaded paths are saved in metadata explicitly; unsaved uploads remain private orphans until reviewed cleanup. PUBLIC is metadata only.

Dashboard uses campaign runs by start date (UTC), verified correctness/pass values, and client timing telemetry in verified results. Term boundaries, teacher activity instrumentation, observed difficulty and non-Math game results are not available and are not fabricated. Grade labels are the stored game profile labels.

## Recovery

Before any new data exists, a reviewed rollback may remove the new policies, trigger/function and metadata table, then remove the empty private bucket. Do not remove shared Storage objects or existing game tables. Never use CASCADE blindly.

After records/uploads exist, retain data, disable the Admin metadata UI if needed, export records and private objects under authorized control, and use a forward-fix migration. Do not drop the table or bucket. Existing gameplay persistence is independent of 011.

## Limitations of local verification

PGlite executes actual PostgreSQL RLS and review triggers with a minimal Storage schema fixture. It does not validate Supabase Storage delivery, project-wide policies, Realtime, hosted Auth, browser cross-device behavior or production readiness. Hosted verification remains required.
