# ADR-127: A config may ask for an input it can decline

## Status

Accepted — 2026-09-27 (Marciano, DVTD-zqrl). Bounds
[ADR-118](118-a-config-may-require-the-input-it-reads.md) rather than amending it.

## Context

LGTM approves one of a gate's five polls unread: the player names a slot in prep
off its category alone, and when that poll arrives it is answered with whatever
the community has picked most on it.

Structurally that is Planning Poker and SLA again — a config that reads an input
the player supplies in prep. ADR-118 made both of those **mandatory**, holding
the gate until the call is made, and the natural reading is that LGTM should
join `prepHold` beside them.

It should not, and the reason ADR-118 gives for holding the other two is the
reason.

## Decisions

**An input a config reads is required only when declining it is dominated.**
ADR-118's argument was arithmetic, not etiquette: `estimatePayoutUnits` returns
0 below the bet and `slaUpliftKb` returns 0 on a missed band, so neither call can
cost anything. Betting 1 strictly dominates not betting. A dominated option is
not a decision, it is a trap, and holding the gate is how the trap is closed.

Approving a poll is not dominated. It replaces the answer the player would
otherwise have given, and whether that is good depends on whether the room is
better than they are on that subject — which is exactly what the category on the
prep row is for. Declining is right on a subject they know cold and wrong on one
they do not. So LGTM stays optional, `PREP_EXITS` and `prepHold` are untouched,
and no liveness carve-out is needed.

The test to apply to the next config that wants an input: **can declining ever
be right?** If no, hold the gate. If yes, holding it is nagging.

**A benefit may read the room; the threshold it reads may not be stated.** The
pool is every honest answer the poll has ever taken, mirror-gate answers
excluded — the same pool Telemetry reads. A poll below two prior answers cannot
be approved, and the row says `needs 2 approvals` and never the live count.
Sample size is Telemetry's level-2 upgrade, so a second config handing it out
free would sell the same thing twice. The count is mapped to a boolean on the
server and never crosses the boundary.

**The crowd's pick is every option a majority picked, not the top one.** More
than half of the responses, falling back to the single most-picked when nothing
clears half, ties broken on the lower option id read as a number. The rule is
computed on raw counts rather than the rounded percentages the split is
presented with, because two options on 50.4% and 50.2% both round to 50 and
would both be dropped.

The alternative was to refuse select-all polls as a stated dead case. That was
rejected: the refusal has to be stated on the prep row, and a row reading
`waits for a single-answer poll` leaks precisely what **207 Multi-Status**
exists to hide. The majority-set rule works on both poll types and states
nothing. The cost is a real hole — on a select-all the fallback branch can only
land a partial — and the config's own `costs` line says so.

**The approval is keyed on the poll, not the slot.** `git rebase -i` reorders
the gate slice, so an approval held as an index would follow the reordering onto
a different question. It is cleared at `closeWindow`, in the one object spread
into all four of its exits. Not at `finishReward`: prep is left through
`finish-reward` at every gate after the first, so clearing there would wipe the
approval at the moment the window opens.

**LGTM resolves in its own service, and adds no reducer action.** The pick is
read from the community and must be verified against the approval, so it cannot
be a pure reducer action. It is not stamped onto one either: an action the
reducer does not handle returns identity, and `applyActionToRun` returns early on
identity **before** the block that records the answer, so such an action would
grade nothing and record nothing silently. `withSeed` is the standing proof —
`open-audit` and `repackage` have been inert in production since they were
written, with no type error and no failing test. Instead the service resolves the
pick and dispatches an ordinary `answer`, the shape `fireAuditService` already
uses, so grading, recording and objectives are untouched by construction.

## Consequences

- ADR-042's pillar-3 tension is not spent again. ADR-118 spent it twice; this
  decision draws the line rather than moving it, so the count of configs that can
  hold a gate stays at two.
- The bean's reveal line — "you and 7 others LGTM'd this" — is not buildable.
  Counting approvals needs a column on `polls_responses`, and the decision that
  LGTM answers feed the pool they read was taken specifically to avoid a
  migration. Stating the crowd's *share* instead is off the table for the reason
  above. The reveal states no figure.
- LGTM answers are part of the pool the next player reads, so a copied answer
  widens the leader's margin. On a poll the room has wrong, the room gets more
  wrong. Accepted knowingly: the pool is lifetime and deep, and a crowd that
  copies itself is what the config is about.
