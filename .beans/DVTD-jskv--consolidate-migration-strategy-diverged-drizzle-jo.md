---
# DVTD-jskv
title: 'Consolidate migration strategy: diverged drizzle journal + push/supabase-SQL split'
status: todo
type: task
created_at: 2026-07-17T17:35:38Z
updated_at: 2026-07-17T17:35:38Z
---

Dev DB journal (drizzle.__drizzle_migrations, 63 entries) has diverged from the branch migration folder (61 files; mode column recorded as applied but absent until 2026-07-17 manual fix). runs table carries orphan experiment columns (held_script_ids, fired_scripts, pending_pack, pack_storage_used) not in schema.ts, which makes drizzle-kit push prompt for rename conflicts. Decide one story: either adopt generate+migrate everywhere (repair/baseline the journal, drop orphan columns after verifying they are dead) or officially declare push-for-dev + hand-written guarded supabase/migrations for prod (current de-facto convention) and delete the stale drizzle history. Record the outcome in an ADR.
