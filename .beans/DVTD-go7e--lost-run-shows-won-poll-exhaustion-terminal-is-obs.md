---
# DVTD-go7e
title: Lost run shows "won" — poll-exhaustion terminal is obsolete
status: todo
type: bug
priority: high
created_at: 2026-07-24T15:03:09Z
updated_at: 2026-07-24T15:03:19Z
parent: DVTD-u35m
---

## Symptom
Lost a run (0 gates cleared, all fails, coverage 6.3%) but the end screen shows "won" / green.

## Cause
The engine treats **running out of polls as a win** (`run.model.ts:453` + `:512`, documented in `seed.service.ts` SEED_LENGTH comment). The only real win is clearing VICTORY_GATE (5) gates. Worse: an exhaustion-"win" banks **100%** of storage into meta (`queries.ts:452` → "victory" credit rate).

Triggered because the dev DB has few published polls: failing gate 1 a few times empties the deck before the summit is even reachable (<25 polls = summit impossible).

## Real issue: the model contradicts itself
"Exhaustion = win" only fits the **ADR-009** model (one self-contained ~50-poll deck, all 5 gates in one sitting) — which the code implements. The **intended** model (Marciano, 2026-07-24): **1 gate = 1 day = 5 polls, locks after, 5 new polls tomorrow. Poll exhaustion is not a concept.** That's the daily-gate lock — implemented **nowhere** — and ADR-009 explicitly *rejected* it (catastrophic death). ADR-011 reopened cross-day persistence but never added the per-gate lock.

## Decision needed BEFORE any code
In the daily-gate model, what does **losing a gate** do?
- (a) nothing terminal — always continue tomorrow; no "dead" run, summit is the only ending
- (b) strip-on-fail continues (ADR-006); run ends only when the build goes bare
- (c) lose = run over today; a fresh run starts tomorrow

Whether "dead" exists, the summary copy, and storage-banking-on-loss all fall out of this.

## Todo
- [ ] Decide loss semantics (a/b/c)
- [ ] Update ADR (supersede ADR-009/011 daily-gate framing)
- [ ] Remove "exhaustion = win"; implement the daily gate lock
