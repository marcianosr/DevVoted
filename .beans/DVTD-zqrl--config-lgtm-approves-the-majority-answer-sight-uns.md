---
# DVTD-zqrl
title: 'Config: LGTM approves the majority answer sight unseen'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-06T07:35:21Z
updated_at: 2026-09-06T09:57:03Z
parent: DVTD-72d9
---

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

- [ ] Sim majority accuracy off real poll data to price slots and uses
- [ ] Decide the approvals threshold
- [ ] Decide multi-answer handling and the 300 rule
- [ ] Decide once-per-window vs unlimited
