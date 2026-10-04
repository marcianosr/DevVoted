---
# DVTD-zqrl
title: 'Config: LGTM submits the crowd''s answer without opening the poll'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-06T07:35:21Z
updated_at: 2026-09-27T13:53:59Z
parent: DVTD-72d9
---

**What:** A config that answers a poll blind, picking whatever most players have picked.

**Why:** A real decision made off the envelope alone, and it writes a water-cooler line afterwards.

## Done when
- [x] How many prior answers a poll needs before the press works is decided
- [x] Pressing it before opening the poll submits the most-picked option
- [x] Opening the poll withdraws the press
- [x] A wrong LGTM costs exactly what any wrong answer costs
- [x] Decided: multi-answer polls, the audit that inverts the majority, and once a window or not

## Notes

## Design (2026-09-06 session)

- 2 slots. While a poll is still unopened, the LGTM press submits it blind: your pick becomes the option the community has picked most on this poll. Opening the poll withdraws the button, because approving means not reading the diff. You decide off the envelope alone (category, facts line), and under a 404 audit not even that.
- The pool is the peek pool: every answer the poll has ever taken across both loops, minus mirror-gate answers (they invert the signal).
- The bound is the meme: the button reads "needs 2 approvals" and stays grey until the poll has enough lifetime answers. No fee, the bound is the price.
- Grading is untouched: streak, bleed and coverage treat the pick like any hand-made answer, so a wrong LGTM bleeds at full price. Only the benefit reads social data (the DVTD-72d9 principle: a check never depends on social data, benefits may).
- The async objection, answered: the pool is lifetime rather than today, and the ~475-poll bank reuses polls across seeds, so cold-start is rare; the approvals bound covers the rest. The first player to ever see a poll simply cannot press it.
- Reveal line writes the water-cooler story: "you and 7 others LGTM'd this".

## Rules to settle

- 300 Multiple Choices inverts what the majority means; v1 disables LGTM under 300, stated on the button.
- Multi-answer polls: majority exact set vs top-k options, or v1 ships single-answer only as a stated dead case (.length precedent).
- Once per window vs unlimited (the full crowd-surf build): the bleed may already price spam out, sim it.

## Todo

- Sim majority accuracy off real poll data to price slots and uses
- Decide the approvals threshold
- Decide multi-answer handling and the 300 rule
- Decide once-per-window vs unlimited

## Summary of Changes

Built 2026-09-27. LGTM is on the roster (2 slots, 64 KB, unlocks at 45 gates cleared).

**The design moved, because the premise did not survive the code.** The bean
assumed an unopened-poll state that has never existed: the view hands the client
the whole poll the instant the window opens, and there is no `open-poll` action
or pre-open step anywhere. So the blind moment moved to **prep**, where the only
blind surface already lives. You name one of the gate's five upcoming slots off
its category alone; when that poll arrives its option keys are inert and the only
press is LGTM.

That supersedes the "Opening the poll withdraws the press" box. Ticked because
the outcome it wanted is met more strongly than the mechanic it named: you never
get to choose after seeing the question at all, rather than losing the press once
you look.

**Settled rules:** threshold 2 prior honest answers · the row states
`needs 2 approvals` and never the live count, since sample size is Telemetry L2's
product · LGTM answers do feed the pool they read, so no column and no migration ·
once per window, bounded by one field holding one poll id rather than a counter.

**The crowd's pick** is every option more than half of responses picked, falling
back to the single most-picked, ties on the lower id read numerically. Computed
on raw counts, not the rounded percentages, or two options on 50.4% and 50.2%
both round to 50 and both get dropped. Select-all polls are handled rather than
refused: a refusal row would have to read "waits for a single-answer poll", which
leaks what 207 Multi-Status hides.

**Audits:** refused outright under 300 (the mirror inverts what a majority
means); under 404 the categories read `?????` and the approval is blind twice
over. The two can never share a gate.

**Not built, and why:** the bean's reveal line, "you and 7 others LGTM'd this".
Counting approvals needs a column on `polls_responses`, and the no-migration
decision ruled that out. Stating the crowd's share instead would give away
Telemetry's product. The reveal states no figure.

See [ADR-127](../docs/adr/127-a-config-may-ask-for-an-input-it-can-decline.md) for
the argument that LGTM must **not** hold the gate the way ADR-118's two configs
do, and for why it resolves in its own service rather than as a reducer action.

**Verified:** 4237 tests pass across 217 files (58 new), `tsc --noEmit` clean,
oxlint + dependency-cruiser + docs:check clean. One unrelated failure stands on
this branch: `Screen.spec.tsx` fails because `src/styles/app.css` was reformatted
by prettier before this session, eating the space in `max(c * var(...))` at four
sites. Untouched here.
