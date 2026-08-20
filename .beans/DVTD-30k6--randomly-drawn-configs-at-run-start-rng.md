---
# DVTD-30k6
title: Randomly drawn configs at run start (RNG)
status: draft
type: feature
priority: critical
created_at: 2026-07-16T20:30:06Z
updated_at: 2026-08-20T09:04:59Z
parent: DVTD-kulw
blocked_by:
    - DVTD-2try
---

Idea captured, mechanics still TBD.

Right now the start-of-run config pool (the "handed" configs a player picks from in ConfiguringScreen) is a hardcoded, curated array — see HANDED in src/routes/proto-session-run.tsx:115. It's identical every run: same 9 configs, same order, every time. Contrast with the shop mid-run draft (`rollDraft` in src/modules/session-run/draft/draft.model.ts), which at least rotates through the full roster by a seed — though that's a deterministic cycle (`(seed + offset) % pool.length`), not true weighted RNG either. DVTD-5ljh already queues making that mid-run draft rarity-weighted; this bean is the same problem at run-start instead of mid-run.

Rough direction: replace the fixed HANDED array with a random draw from the (eventually unlocked — see DVTD-2try) config pool at session start.

Open questions:
- Should the start-of-run draw share the same weighting logic as DVTD-5ljh's mid-run draft, or have its own curve (e.g. guarantee at least one common Focus config so a fresh run isn't stranded with only situational picks)?
- How many configs get handed at start — same DRAFT_SIZE=3 as mid-run drafts, or a bigger initial hand since this replaces a 9-config curated set the player picks a full pipeline from?
- Does the always-slotted starter (`fixed: [CONFIGS.unitTests]` in createSession) stay hardcoded, or does it also roll?
- Where does the RNG seed come from — a per-run seed (reproducible/shareable runs, daily-challenge-friendly) vs a fresh random source each time? `rollDraft(seed, ...)`'s signature already expects a caller-supplied seed, which argues for a per-run seed threaded through `createSession(polls, handed, fixed)`.
- Depends on DVTD-2try (config unlocks): only unlocked configs should be eligible to be drawn — until that lands, draw from the full CONFIG_LIST.
