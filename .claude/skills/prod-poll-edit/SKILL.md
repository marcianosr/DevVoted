---
name: prod-poll-edit
description: Apply a fix to a live poll in the PRODUCTION database (question, code block, explanation, option text or answer key) with guarded SQL. Use when the user says "fix this poll in prod", "apply the poll-checker fix", "edit poll #N live", or approves a rewrite from /poll-checker.
argument-hint: <poll number | poll id> <what to change>
---

# Prod poll edit

The repo is supabase-linked to PROD: `--linked` is production, `.env` is local only. Every supabase command carries an explicit `--linked` or `--local`.

## Tables

- `polls`: `id`, `poll_number` (what players see as #N), `question`, `code_block`, `explanation`, `updated_at`
- `polls_options`: `id`, `poll_id`, `option`, `correct`, `explanation`

## Flow

1. **Read the current row.** Reads always pass. Run it bare (no `cd`, no pipe), or it misses the allow rule:
   `supabase db query --linked "select p.id, p.poll_number, p.question, p.code_block, p.explanation, o.id as option_id, o.option, o.correct, o.explanation as option_explanation from polls p join polls_options o on o.poll_id = p.id where p.poll_number = <N> order by o.id"`
2. **Write the SQL** to the scratchpad as `poll-<N>-fix.sql`:
   - one `begin; … commit;`
   - every UPDATE is guarded by `id` AND the exact old text (`where id = 492 and question = '<old>'`), so a row that drifted since step 1 updates nothing
   - any content change also sets `polls.updated_at = now()` on that poll. Raw SQL skips Drizzle's `$onUpdate`, and admin review state reads `updated_at > reviewed_at` as "changed"
   - escape single quotes by doubling them (`''`)
3. **Show the diff** as old → new per field, and wait for a yes.
4. **Apply.** If the user said in this conversation that you may edit in Supabase, run `supabase db query --linked -f <path>`. If not, give them `! supabase db query --linked -f <path>` to run.
5. **Verify.** Run the step 1 read again and confirm every field changed. A guard that matched nothing fails silently, so a no-op shows up here.

## Answer key changes

Flipping `correct` on a poll players have already answered changes what their old answers mean. Before you write that UPDATE, count the affected answers:
`supabase db query --linked "select count(*) from polls_responses where poll_id = <id>"`
Then state the count and get a separate yes for the key change.

## Never

- INSERT or DELETE polls or options. That goes through the admin authoring flow.
- Run `supabase migration repair` or `db push` from this skill.
- Bump `updated_at` for a write that changes no content.
