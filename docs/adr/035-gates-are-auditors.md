# ADR-035: Gates are auditors — checks off configs, fresh coverage per gate, free redo

## Status

Accepted — 2026-08-17 (Marciano, DVTD-zjeq/DVTD-gre4). Decision 3 superseded the same day by [ADR-037](037-a-missed-gate-peels-a-config.md) (a miss peels a config); Decision 4's "strips are audit-owned" narrowed by it too. Supersedes 016, 017, 022, 033 (the Effect+Check rulebook), 021 (death at the gate), 027 and 031 (width demand and the graded shop exit), 028 (the defeat device reads audits now). Reverses ADR-034 Decisions 1, 3 and 6; amends 006 §4 and 013. Prior art: `docs/brainstorm/23-03-2026-variable-gate-requirements.md`, DVTD-5o4d.

## Context

The Config Rule put the friction on the build: every config carried a check, and the gate was the checklist those configs composed. Playtests kept showing the same thing — the checks read as homework attached to purchases, and death at a failed gate punished experimentation. This ADR moves the friction to the gate itself: gates get personality, configs get simpler, and failure gets cheaper.

## Decision 1: configs are pure enhancements

A config is an effect with a price — it demands nothing. `CheckKind`, `Config.check/checkAmount/needs`, all nine check builders, the synthesized Correct row, mastery checks and the `RosterConfig` type enforcement are deleted. Configs whose effects reused check machinery keep the effect: `.length` still shows the window's correct-answer count and pays per extra pick, Telemetry still sells peeks, Moore's Law pays interest with no balance floor, Unit Tests pays its flat clear payout unconditionally.

## Decision 2: each gate demands fresh coverage in its own window

`GateWindow.coverageGained` is the gate's score meter: net of wrong-answer losses, floored at 0, reset with every attempt. The gate passes when the meter meets its row of the table — the run's career total never counts. `RunState.coverage`/`coverageByCategory` stay as career accumulators for the leaderboard and Focus upgrades. The laps display (Line/Branch/Mutation/Fuzz) is gone with the total it read.

| Gate | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Demand % | 3 | 10 | 25 | 40 | 60 | 85 | 110 | 140 | 175 | 210 | 250 | 290 | 340 |

Per-answer earn scales with `gatesCleared + 1`, so the demand-to-base-pace ratio is the real ramp and the tuning knob. Tune the rows first, then `WRONG_COVERAGE_LOSS`; never `gateBaseMultiplier` — it reprices every config. Rows live in `rules.model.ts`.

## Decision 3: failing a gate is a free redo

> ⚠ Superseded by [ADR-037](037-a-missed-gate-peels-a-config.md) — a miss peels a config and runs the post-gate loop again at the same gate.

Miss the demand and the same gate deals five fresh polls: no strip, no shop detour, no death. The costs are already there — the storage bill charges on every window close, pass or fail, and each attempt drains the day's finite polls. The width demand, the blocked shop exit and the End-run click are deleted; the one width rule left is that sell and drop refuse the last config, because a bare build fails every redo forever. A bare legacy snapshot dies at the gate instead of soft-locking.

## Decision 4: audits are the gate's personality

An audit is a fixed thematic rule a gate carries (`gate/domain/audit.model.ts`). Gates 1–3 are always clean; deeper gates carry one; the deepest may stack two. Launch roster:

| Gate | Audit | Rule |
| --- | --- | --- |
| 7 Marsh | Mirrored | wrong answers earn coverage, correct ones bleed it |
| 9 Volcano | Burn | KB burns on every poll, more on a wrong answer |
| 11 Elite | Strip | failing the gate peels 2 configs |
| 12 Champion | Burn + Strip | both, stacked |

> ⚠ Extended by [ADR-038](038-the-audit-roster.md) — the roster now covers every gate from 3 and the count escalates; the Burn is renamed Memory Leak, and the Mirror flips the poll rather than the score (so its demand discount is gone). Narrowed again by [ADR-056](056-audits-are-drawn-not-scheduled.md) — an audit is no longer "a fixed thematic rule a gate carries": gates 4–11 draw from staged pools seeded on the date, and only gates 3 and 12 are authored.

Strips are audit-owned now — the only trigger left. A strip-audit fail routes strip → shop → prep → same gate, and a quota that takes the whole build ends the run: stake-fatal death survives only where a gate explicitly threatens it, named on the stake receipt. (⚠ [ADR-037](037-a-missed-gate-peels-a-config.md): every gate peels on a miss, and a strip audit only deepens the peel. The routing here is what every failed gate now does.) KB insolvency keeps its ADR-023 behavior (plan downgrade, never death). Gates 4–6, 8 and 10 are open content slots (DVTD-6moy).

## Decision 5: Volkswagen CI reads the audits

The defeat device returns as the audit suppressor: installed, it reports the gate's first audit as passing, struck through on the stake receipt — fraud visible, not silent, ADR-028's principle against the new rulebook. Same price (384KB, legendary). Its real home is the strip audits; if it trivializes Marsh and Volcano, DVTD-ud69 reprices it.

## Consequences

- Beans: DVTD-1x7w, DVTD-fy6v, DVTD-6tod, DVTD-eguq, DVTD-ineo scrapped; DVTD-5o4d shipped as the Marsh audit; DVTD-wlte closed.
- The pin (a shop-bought cross-run checkpoint) rides on this death model and gets its own ADR-036.
- Balance debt: Unit Tests and AGENTS.md are now unconditional payouts — the audits are the friction that prices them, so their numbers may need a pass once Marsh/Volcano playtests land.
