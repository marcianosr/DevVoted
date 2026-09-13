# ADR-035: Gates are auditors — checks off configs, fresh coverage per gate

## Status

Accepted 2026-08-17 (Marciano, DVTD-zjeq/DVTD-gre4). The ADR that moved the
game's friction from the build onto the gate.

Supersedes the Effect+Check rulebook (016, 017, 022, 033), death at the gate
(021), the width demand and graded shop exit (027, 031), and reverses ADR-034
Decisions 1, 3 and 6. Amends ADR-006 §4 and ADR-013. All six of those ADRs are
now deleted; see [rejected.md](rejected.md) for what they argued.

**Amended since:** Decision 3 (the free redo) superseded the same day by
[ADR-037](037-a-missed-gate-peels-a-config.md). Decision 4 extended by
[ADR-038](038-the-audit-roster.md) and narrowed by
[ADR-056](056-audits-are-drawn-not-scheduled.md).

Prior art: `docs/brainstorm/23-03-2026-variable-gate-requirements.md`, DVTD-5o4d.

## Context

The Config Rule put the friction on the build: every config carried a check, and
the gate was the checklist those configs composed. Playtests kept showing the
same two things. The checks read as homework attached to purchases, and death at
a failed gate punished experimentation.

This ADR moves the friction to the gate itself: gates get personality, configs
get simpler, failure gets cheaper.

## Decision 1: configs are pure enhancements

A config is an effect with a price. It demands nothing.

`CheckKind`, `Config.check/checkAmount/needs`, all nine check builders, the
synthesized Correct row, mastery checks and the `RosterConfig` type enforcement
are deleted. Configs whose effects reused check machinery keep the effect:
`.length` still shows the window's correct-answer count and pays per extra pick,
Telemetry still sells peeks, Moore's Law pays interest with no balance floor,
Unit Tests pays its flat clear payout unconditionally.

## Decision 2: each gate demands fresh coverage in its own window

`GateWindow.coverageGained` is the gate's score meter: net of wrong-answer
losses, floored at 0, **reset with every attempt**. The gate passes when the
meter meets the gate's HEALTHY line; the run's career total never counts.
`RunState.coverage` and `coverageByCategory` stay as career accumulators for the
leaderboard and Focus upgrades.

The per-answer earn is flat ([ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md)),
so the line itself is the whole ramp and the only tuning knob. Tune
`HEALTHY_LADDER` first, then `LOSS_LADDER`; both live in `coverageRatio.model.ts`.

The laps display (Line/Branch/Mutation/Fuzz) went with the career total it read.

## Decision 3: failing a gate is a free redo

Superseded the same day by [ADR-037](037-a-missed-gate-peels-a-config.md): a
miss peels a config and re-runs the post-gate loop at the same gate.

What survives is the width rule this decision left behind. Sell and drop refuse
the last config, because a bare build fails every redo forever, and a bare
legacy snapshot dies at the gate rather than soft-locking. That floor of one
config is the *only* width rule; the per-gate demand is gone.

## Decision 4: audits are the gate's personality

An audit is a thematic rule a gate carries (`gate/domain/audit.model.ts`).
Gates 0–2 are clean for onboarding; deeper gates carry one, then more.

Strips became audit-owned here, as the only remaining death trigger, with
stake-fatal death surviving only where a gate explicitly threatens it and names
it on the stake receipt. ADR-037 changed that: every gate peels on a miss and a
strip audit only deepens the peel, so the strip → shop → prep → same-gate
routing described here is what *every* failed gate now does.

The roster and the escalation curve are [ADR-038](038-the-audit-roster.md)'s;
which gate carries which audit is [ADR-056](056-audits-are-drawn-not-scheduled.md)'s,
and only gates 3 and 12 stay authored. KB insolvency is never fatal
([ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4: it peels
the build down to what the bill allows).

## Decision 5: Volkswagen CI reads the audits

The defeat device returns as the audit suppressor, reporting the gate's first
audit as passing, struck through on the receipt: fraud visible, not silent, which
is [ADR-028](028-the-defeat-device.md)'s principle carried onto the new rulebook.

## Consequences

- Balance debt: Unit Tests and AGENTS.md became unconditional payouts. The
  audits are the friction that prices them.
- The demand rows were priced when a miss was free. ADR-038 then added a second
  source of difficulty on top without moving them, so they are the first thing
  to loosen if the middle gates read as punishing.
- The git tag (ADR-036) rides on this death model.
- Beans DVTD-1x7w, DVTD-fy6v, DVTD-6tod, DVTD-eguq, DVTD-ineo scrapped;
  DVTD-5o4d shipped as the Marsh audit; DVTD-wlte closed.
