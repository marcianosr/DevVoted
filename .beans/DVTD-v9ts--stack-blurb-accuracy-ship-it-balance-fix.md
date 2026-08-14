---
# DVTD-v9ts
title: Stack blurb accuracy + Ship it balance fix
status: completed
type: task
created_at: 2026-08-10T13:23:59Z
updated_at: 2026-08-10T13:23:59Z
---

Continuation of the same-day onboarding work (DVTD-46q8 -> DVTD-iyhz -> DVTD-eel2). Marciano flagged two more issues after seeing the stacks running:

1. "Test everything" (ts, unitTests, eslint) had no real synergy — ESLint's cross-out only fires on JS/TS polls, but Unit Tests is a generic correctness check unrelated to JS/TS. Marciano proposed swapping Unit Tests for .js, making ESLint's defense actually cover both forced-correctness categories in the stack. Blurb updated to "Excel on JS/TS, ESLint has your back."
2. "Ship it"'s blurb ("Higher payouts, nothing protecting you") called coverage gains a "payout" — factually wrong (all 3 configs multiply coverage, never storage/KB; the game deliberately keeps those two currencies distinct). Fixed to "Fast coverage, nothing protecting you." While investigating, found a real balance issue: Cold Start's check runs every gate for the whole run and a failed check fails the gate outright — the only unconditional per-gate demand across all three starter stacks, disproportionately punishing for a first pick a new player can't yet judge the risk of. Asked Marciano via AskUserQuestion; he chose swapping Cold Start for Code Coverage (never miss twice in a row) over relabeling-as-hard or adding a 4th stack.

## Summary of Changes

- stack.model.ts: test-everything -> [js, ts, eslint]; ship-it -> [js, jsx, codeCoverage]; both blurbs rewritten with rationale comments.
- Updated all specs/stories hardcoding old stack membership: run.model.spec.ts (starter stacks describe block), ConfiguringScreen.spec.tsx (js demand/gives assertions, custom RTL text matcher for emphasizeNumbers-split text), StackPreviewList.stories.tsx.
- ADR-026: added Decision 5 (no curated stack should carry an unconditional per-gate demand) + updated Decision on Test everything's combo rationale.
- CHANGELOG unreleased entry blurbs updated to match.
- Verified: tsc clean, oxlint+depcruise clean, 1344 tests pass (same 8 pre-existing failures as HEAD).
