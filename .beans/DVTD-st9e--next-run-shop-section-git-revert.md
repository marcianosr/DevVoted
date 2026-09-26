---
# DVTD-st9e
title: '"Next run" shop section: git revert'
status: draft
type: feature
priority: normal
created_at: 2026-08-24T16:52:22Z
updated_at: 2026-09-25T11:00:14Z
---

Group the purchases that shape your NEXT run into one shop section, and add `git revert` as its second member.

## Why a section

`git tag` is already its own Fold in the shop. It is currently the only thing you can buy that pays out after this run ends, so it reads as a special case rather than a system.

Marciano (2026-08-24) wanted "more influence on the start" for the next run: a rebuild, an extra slot, maybe a config, and `git revert` (one free undo on a wrong answer).

## The finding that shapes it

**git tag does not improve your next start, it deletes it.** ADR-036: a planted tag means the next run *checks out at that gate* — no opening deal, no starter stack, no empty slots. So a bought rebuild can never pay off on a run the tag also fires on.

That makes these alternatives to one question rather than neighbours, which is the argument for one section:

- **git tag** — I expect to die here. Buy a checkpoint.
- **git revert** — I expect to survive. Buy insurance for the next one.

Both spend this run's KB on a run not yet started.

## Section name

**"Next run"**. No new vocabulary; states the only thing its members share. ("Shop extender" describes none of them; "carry over" coins a word for a section whose members are named after git commands.)

## Scope: git revert only

- [ ] Rename the shop's `git tag` Fold to "Next run", with git tag as its first row
- [ ] Add `git revert`: one wrong answer next run waives its `WRONG_COVERAGE_LOSS` (0.25)
- [ ] Price it flat, not by depth (unlike git tag, its value does not grow with how far you got) — exact number undecided
- [ ] Persist on the account like `pinPlantedAtGate` does
- [ ] Surface the held revert on the poll screen as a free press beside the paid lint/peek

**True name check:** `git revert` undoes a commit's *effect* without erasing it from history. "The wrong answer still happened, its penalty is reversed" is exactly that. No un-answering or coverage rollback needed.

## Rejected from this scope

- **Extra starting slot** — reopens ADR-034. Slots are derived, not stored: `slotsForGatesCleared = min(14, 3 + max(0, gatesCleared - 1))`, deliberately so that "width supply is deterministic and coverage is never priced on two ladders at once". A bought slot restores the second ladder that ADR deleted.
- **A free starting config** — starter stacks hold exactly `BASE_SLOTS` configs and the spec enforces it. A fourth config has nowhere to sit without the slot above, so it can only be a swap.
- **A free rebuild** — a coupon on an existing action, not a new capability. Note `StartView` never passes `rebuild`, so the start-screen rebuild is Storybook-only today.

## The taxonomy now has a word for this (DVTD-r2k9, ADR-110)

ADR-110 settled four tiers — config, control, service, licence — each differing
on availability, duration and cost. A *Next run* section is a fifth row rather
than a stretch of any of them: bought with run storage like a control, but
paying out after the run ends, which no existing row does.

Two things from that ADR bear on this bean:

- Its Decision 6 accepts a **rebate** on the fifth Rebuild of a visit while
  leaving this bean's rejection of "a free rebuild — a coupon on an existing
  action" standing. The distinction is that reaching a rebate costs run storage
  that could have bought a config, so nothing is handed over. If this bean is
  revived, that is the line the two share.
- Its Decision 5 — a panel renders only when it holds something — applies to a
  *Next run* section too. With git tag sold only from gate 4 to gate 10, the
  section would otherwise sit empty for most of a run.

Repackage is confirmed a control (DVTD-406l, restated in ADR-110 D7), so it is
not a candidate for this section either.

⚠️ 2026-09-25: the four-tier taxonomy this bean cites is gone (ADR-115 replaced ADR-110). The archive is now the wallet for anything that shapes a run before it starts, and the git tag is bought that way, so git revert is a run-service candidate and a "Next run" section paid with run KB has no row. Check before starting.
