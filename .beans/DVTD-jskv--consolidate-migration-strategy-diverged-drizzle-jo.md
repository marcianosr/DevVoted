---
# DVTD-jskv
title: 'Consolidate migration strategy: diverged drizzle journal + push/supabase-SQL split'
status: completed
type: task
priority: normal
created_at: 2026-07-17T17:35:38Z
updated_at: 2026-07-18T13:06:42Z
---

Dev DB journal (drizzle.__drizzle_migrations, 63 entries) has diverged from the branch migration folder (61 files; mode column recorded as applied but absent until 2026-07-17 manual fix). runs table carries orphan experiment columns (held_script_ids, fired_scripts, pending_pack, pack_storage_used) not in schema.ts, which makes drizzle-kit push prompt for rename conflicts. Decide one story: either adopt generate+migrate everywhere (repair/baseline the journal, drop orphan columns after verifying they are dead) or officially declare push-for-dev + hand-written guarded supabase/migrations for prod (current de-facto convention) and delete the stale drizzle history. Record the outcome in an ADR.

## Summary of Changes (ADR-012)

- ADR-012: schema.ts = source of truth for shape; supabase/migrations guarded SQL = the ONLY change pipeline (CI main.yaml supabase db push already did this for PRD). drizzle generate/migrate retired.
- Deleted drizzle/ (61 generated files; git history keeps them), dropped drizzle.__drizzle_migrations + schema via migration 20260718130000.
- Dropped 4 orphan runs columns (held_script_ids, fired_scripts, pending_pack, pack_storage_used) — audit showed 0/1/0/1 rows with data, experiment leftovers knowingly discarded (Marciano approved recommended path).
- package.json: db:generate/db:migrate removed, db:refresh = reset+push+seed. CLAUDE.md db section updated to point at ADR-012.
- Verified on local DB: 0 orphan columns, drizzle schema gone. Lint+arch, build, targeted tests green.
