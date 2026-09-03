# Backend V1.1 pilot: local implementation, hosted gate still closed

## Current evidence

Repository: `D:\โรงเรียน\วิชาการ\2569\E-learning-game`; branch `main`; baseline HEAD `cef781c0cb869c103f29381234ef18240917b8f6`. Existing dirty foundation retained. No actual pilot users, remote files, hosted migrations or deployments were created.

Designated staging project reference: **NOT PROVIDED / NOT VERIFIED**.
Migration state before: **HOSTED UNKNOWN**. After: **UNCHANGED BY THIS SPRINT**.
Hosted RLS, Storage bucket state and functions/policies: **NOT INSPECTED**.
Drive execution: **WAITING_FOR_DRIVE_FOLDER_ID**, plus server credentials and root access validation.

## Operator input and configuration

Use a separate confirmed Game staging project. Do not infer that the existing healthy project is staging. Supply its project reference, the Production project reference as an exclusion, and staging HTTPS frontend origin. First Admin must already have real Supabase Auth, an ACTIVE linked game profile and organization-scoped ADMIN membership. This API cannot create ADMIN users.

Server-only environment variables (secret manager; never VITE variables or committed files):

```text
SUPABASE_URL=https://<staging-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server secret>
GAME_STAGING_PROJECT_REF=<confirmed staging ref>
GAME_PRODUCTION_PROJECT_REF=<production ref to exclude>
GAME_ALLOWED_ORIGIN=https://<exact staging frontend origin>
BACKEND_API_PORT=8788
GOOGLE_DRIVE_LIBRARY_ROOT_FOLDER_ID=<provided separately>
GOOGLE_DRIVE_CLIENT_ID=<OAuth client id>
GOOGLE_DRIVE_CLIENT_SECRET=<server secret>
GOOGLE_DRIVE_REFRESH_TOKEN=<server secret>
```

Browser configuration remains `VITE_AUTH_MODE=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Use the same-origin HTTPS reverse proxy for `/backend-api/*`; no Google secrets in browser configuration. Configure proxy request limit 14.5 MB, timeouts over 110 seconds and rate limits appropriate for a 15-person pilot. Do not log Authorization headers or request bodies (passwords/files).

Google setup: enable Drive API; obtain server-side offline OAuth credentials for a dedicated Admin-controlled account. Prefer `https://www.googleapis.com/auth/drive.file`; the root must have been created by or explicitly granted to that OAuth application, for example through an authorized Picker flow. A folder ID alone does not grant access. OAuth consent/Pickers are operator setup, not implemented here. Test-token expiry and refresh-token lifecycle must be checked before pilot use.

For this pilot the root must be private to its owner. The adapter rejects a root with non-owner permissions. Shared Drives or shared roots require another reviewed permission model; do not weaken the check to make uploads succeed. PRIVATE/INTERNAL/PUBLIC remain Supabase metadata; uploads never add public Drive permissions. An owner changing permissions later is outside application control and requires operational review.

Conceptual folder map: `01_Library`, `02_Assessment_Sources`, `03_Question_Sets`, `04_Game_Visual`, `05_Exports`. V1.1 writes Library sources directly under the one configured root; these optional subfolders are not created automatically. Subject/grade/type filtering stays in Supabase. Existing territory visuals remain in their V1 storage path; no visual migration.

## Manual migration and staging sequence

1. HUMAN_REVIEW: Confirm staging and exclusions. Record the actual project reference before any SQL apply. If uncertain, STOP.
2. SAFE_TO_RUN: Use `V1_STAGING_RUNBOOK.md` to inventory 001–010; do not run the development seed. Inspect 011 with `BACKEND_V1_REVIEW.md`.
3. HUMAN_REVIEW: Apply missing 011 to confirmed staging only, then 012. Never automatically replay already-applied migrations. 012 adds `profiles.game_admin_metadata`, `game_admin_operations`, its Admin read policy and service-only `game_finish_pilot_user`. It does not replace 011 or create another Library table.
4. SAFE_TO_RUN: Capture these query results in the staging evidence record:

```sql
select version from supabase_migrations.schema_migrations order by version;
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname='public'
and tablename in ('game_backend_records','game_admin_operations','profiles');
select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id='game-backend';
select policyname,cmd,roles,qual,with_check from pg_policies
where schemaname='storage' and tablename='objects';
select routine_name,grantee,privilege_type from information_schema.routine_privileges
where routine_schema='public' and routine_name='game_finish_pilot_user';
select id,organization_id,actor_id,action,state,file_id,result,created_at,updated_at
from public.game_admin_operations order by created_at desc;
```

SQL-editor applies may not populate migration history. If so, record explicit SQL filenames/checksums and catalog evidence; do not call an absent history row proof of an unapplied migration.

5. HUMAN_REVIEW: Configure server secrets and reverse proxy, then start:

```powershell
node --import tsx scripts/start-backend-pilot-api.mjs
```

The runner refuses an unconfirmed/non-distinct staging project and binds loopback only. It runs no migrations or seeds. Auth and Drive work is performed only on explicit Admin requests.

6. HUMAN_REVIEW: On staging, verify real Admin → Landing logo → Admin login → Backend, and provisioning capabilities. Create one supplied Teacher and Student first. Verify login and Admin denial before entering the remaining records. Existing linked logins can be reset; unlinked game profiles can be provisioned. Existing-email ownership conflicts stop for manual review and never automatically link another account.
7. HUMAN_REVIEW: Create an actual draft Library resource, choose a small source file, Save, verify Drive file under root, then refresh/edit the same Supabase record. Select that stable Library source in Assessment Analyze; it must not upload or duplicate the file.
8. HUMAN_REVIEW: Exercise retry after a lost response and after simulated metadata-write failure in staging. Save the operation ID. Verify one Auth identity / one stable Drive file / one resource record.
9. HUMAN_REVIEW: Repeat with a second browser/device; Teacher and Student must be denied Admin endpoints and restricted Library records. Anonymous/mock requests must fail. Check disabled Admin, removed membership and wrong organization. Record real-account results; mocks do not satisfy this gate.

## Pilot data and limits

Supply 2 Teacher and 12 Student records. Required: unique game code, real name, managed login email, grade, academic year and role. Students also need classroom. Teachers need subject and explicit classes/grades. Optional external IDs are stored as `PILOT_REFERENCE` links, not asserted to be School Management canonical identities. The existing school-system importer remains disabled; CSV batch provisioning is deferred. Manual creation is implemented.

Managed emails are confirmed by the provisioning Admin (`email_confirm=true`); this is suitable only after the operator has verified the supplied managed identities. Passwords must be supplied securely, delivered privately, never included in CSV/logs, and never reused from another system. Reset sets a new password; existing passwords cannot be read. Forced password rotation/expiry and authenticated change-password UI are deferred, so these passwords are operationally temporary, not technically expiring. Existing profile name/status edits remain; login email changes and existing classroom/role reassignment are deferred.

## Failure and recovery contract

- Reuse the SAME operation ID and unchanged form after a timeout. Password retries must use the same new password. Completed requests return their receipt; duplicate creation is prevented by journal/identity checks and stable Drive IDs.
- The browser keeps retry state in memory only, without persistent password caching. Record the operation ID before closing after an error. Closing/reloading loses the local form; reconcile the journal before starting another operation.
- Auth creation succeeds but profile commit fails: Auth may exist with `app_metadata.game_pilot_operation`. No second identity is created on retry; the atomic profile/membership/enrollment/link transaction can resume. Never blindly delete Auth users; inspect any references first.
- Drive succeeds but metadata fails: error includes file ID and operation ID. The journal preserves the reserved file ID, and retry verifies root/checksum before reusing it. No silent deletion occurs. If a draft was concurrently edited, manually reconcile metadata and preserve provenance; do not overwrite its newer version.
- Drive fails: this upload flow has not saved new Library metadata yet. Existing records remain unchanged. Previously saved metadata-only records may legitimately have no file. Existing Supabase attachments are retained when a new Drive reference is added.
- Supabase record save succeeds but journal completion fails: the record's `drive_operation_id` allows retry to return that record without another upload. PENDING journal entries alone do not prove failure.
- Automatic orphan cleanup, Drive permission changes and source-file deletion are intentionally absent. Approved operator cleanup must first confirm no Library record references the file. Restore/forward-fix data after pilot writes; do not drop operations, profiles, 011 metadata or buckets to roll back.

## Local tests and hosted gate

```powershell
npm run build
npx tsx src/tests/backend-pilot.test.ts
npx tsx src/tests/backend-workspace.test.ts
npx tsx src/tests/admin-entry.test.ts
npx tsx src/tests/authentication.test.ts
npx tsx src/tests/acceptance.test.ts
npx tsx src/tests/frozen-engine.test.ts
npx tsx src/tests/timer-corpus-audit.ts
node scripts/test-game-database.mjs
```

Local Drive mocks and disposable PostgreSQL tests do not verify real hosted Auth, Drive credentials, hosted bucket policies, browser delivery or multiple devices. Do not mark READY_FOR_PILOT until the staged real-user loop is recorded.

API references: [Google pre-generated file IDs and retry behavior](https://developers.google.com/workspace/drive/api/guides/create-file), [Supabase Admin user updates](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).
