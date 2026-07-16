---
# DVTD-2try
title: Config unlock system (gates reached / coverage thresholds)
status: draft
type: feature
created_at: 2026-07-16T20:29:52Z
updated_at: 2026-07-16T20:29:52Z
parent: DVTD-u35m
---

Idea captured, mechanics still TBD.

Right now every config in CONFIG_LIST (src/modules/session-run/configs/configRoster.model.ts, 17 configs) is available from run one — both the fixed starting `HANDED` array (src/routes/proto-session-run.tsx:115) and the mid-run `rollDraft` pool (src/modules/session-run/draft/draft.model.ts) draw from the same fully-unlocked roster. There's no progression gate.

Rough direction: configs unlock permanently (account-wide, not per-run) as the player hits milestones, then only unlocked configs are eligible for the start-of-run draw and mid-run drafts.

Open questions:
- What unlocks a config — clearing a specific gate number (ADR-006's gate/climb structure), reaching a coverage threshold in the config's own category (ties into `run_category_coverage.current_coverage` / `final_coverage`), or something else (drawing it once for free, then it's "known")?
- Is unlock per-config (curated: "clear gate 3 to unlock Copilot") or rule-based by rarity (e.g. legendary configs need N total gates cleared, lifetime)?
- Persistence: needs a durable, cross-run store of "configs this user has unlocked" — no such table exists yet (the CLAUDE.md-documented `polls_user_performance` table doesn't actually exist in src/database/schema.ts; only `run_category_coverage` — per-run — and `polls_responses` do). Likely needs a new table or a JSON column on usersTable.
- Does an unlocked-but-not-yet-drawn config show up as a locked/silhouetted teaser anywhere (shop, dev card) to signal "this exists, go earn it," similar to a Pokédex "seen but not caught" state?
- Relates to DVTD-g8ty (Collect Swatches) — that's a per-category color-collectible tied to mastery; this is per-config. Worth deciding if they share one underlying "unlock ledger" or stay separate systems.
