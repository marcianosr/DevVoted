# ADR-040: A config is online, skipped or offline — never passing or failing

## Status

Accepted — 2026-08-25 (Marciano, DVTD-8pgn). Cleans up presentation left behind by
[ADR-035](035-gates-are-auditors.md) Decision 1; reads the offline state defined by
[ADR-038](038-the-audit-roster.md).

## Context

The poll rail marked every config with a pass/fail verdict disc: a green tick normally,
a red cross when an audit had taken it offline. That vocabulary came from
[ADR-022](022-every-config-owes-the-gate-a-check.md), where a config carried a check the
gate graded. ADR-035 deleted the checks. The domain followed (`configRole.model.ts` says
"nothing is a requirement anymore"), the rail did not, and four screens ended up using
the same disc for four different things: installed, owned, new, and live.

## Decision 1: three states, and they are facts about the poll on deck

A config is **online** (in effect on this poll), **skipped** (installed, doing nothing
here) or **offline** (an audit is holding it down). `configStatusFor` in
`config/domain/effect.model.ts` derives it; a config is online when it changes this
poll's coverage, pays on this answer, sells an action here, reads the run ahead, or is
suppressing an audit the gate is actually running.

A skipped config keeps its sentence and loses its figure — a multiplier beside an idle
row reads as coverage being earned. An offline row is struck through and names the audit
to blame, and is never dimmed: the name is what the player came to the rail to read.

## Decision 2: a skipped config says what it was waiting for

`SkipReason` is data, not prose (the `GateRowReason` split): `otherCategories`,
`openerOnly`, `paysAtGateClear`, `billsAtGateClear`, `inShop`, `noAuditToSuppress`,
`notThisPoll`. `Pipeline.ui.tsx` writes the copy. Freemium leads with its bill rather
than its shop discount, because the bill is the half a player forgets.

## Decision 3: only the poll rail carries a status

All three states are true of a specific poll, so the shop and prep rails list configs
with no marker at all. `Mark`'s verdicts stay where something is genuinely graded: the
answers on the reward screen, and the gate's own cleared/missed badge.

## Consequences

- `RunView.offlineConfigs` pairs each config with the audit that took it down, rather
  than a second field keyed by id — no surface can show a dead row it cannot explain.
- The shop shelf still marks owned offers with `Mark variant="pass"` and new ones with
  `warn`. Same borrowed-verdict problem, not fixed here (follow-up).
- The fold header counts the states ("3 online · 2 skipped · 1 offline") instead of
  configs against slots; width lives on prep and the shop.
