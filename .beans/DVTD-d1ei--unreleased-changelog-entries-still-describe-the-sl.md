---
# DVTD-d1ei
title: Unreleased CHANGELOG entries still describe the slot ladder
status: todo
type: task
priority: normal
created_at: 2026-08-27T19:17:44Z
updated_at: 2026-09-14T17:08:51Z
---

Nothing in `## Unreleased` has shipped, so the section will be read as one set of release notes — and it currently contradicts itself. ADR-044's entry says the pipeline holds spots and opens at 4, while six older unreleased entries still describe the retired slot ladder:

- L32 **Gates grant slots — the coverage ladder is retired** — "still grows from 3 slots to 14"
- L63 **Slots are width, and only width** — coverage unlocks them (deleted by ADR-034/044)
- L68 **Pipeline slots are numbered** — a spot has no identity, so nothing is numbered
- L78 **The next slot shows its unlock price** — width is not bought
- L80 **A clearer run setup screen** — "how many slots you've filled"
- L81 **Build your own starting pipeline** — "3 empty slots", "won't start until all 3 are filled" (the width demand ADR-044 dropped)

Also L72 ("once every slot is filled") and L74 ("its next open slot").

Per `docs/changelog-maintenance.md` these are edited in place, not contradicted by a later entry. The judgement call is whether each one gets rewritten in spot terms or folded into the ADR-044 entry that already covers it — several are now entirely subsumed.

Released sections (1.3.0 and older) must NOT be touched: a changelog records what shipped.

## Todo

- [ ] Decide per entry: rewrite in spots, or delete as subsumed
- [ ] Verify the entry count after editing (see changelog-maintenance.md)

## Model change 2026-09-12 (DVTD-nd6r)

More entries are stale, not fewer, and the fix changes. ADR-074 retired the
bought slot ladder that replaced the coverage ladder these entries describe, so
rewriting them "in spot terms" would document a second retired model. Width is
not granted, not unlocked and not bought: a build carries weight, and weight
bills KB at every gate.

L78 ("the next slot shows its unlock price") and L81 ("3 empty slots", "won't
start until all 3 are filled") are now subsumed rather than rewritable. The
ADR-044 entry this bean would fold them into is itself superseded.

- [ ] Re-read every unreleased entry against ADR-073 and ADR-074 before editing, not only against ADR-044

## Progress 2026-09-14 (ADR-082 / DVTD-uhub)

A new Unreleased entry leads the section: **"You now rent your build space by the
gate, and slots are gone."** It states the ladder, the pay-for-reserved-room rule,
the shop-door lock, the non-fatal drop, and the three things that go with the slot
ladder (the storage plan, the KB cap, archive start slots).

That makes this bean MORE urgent, not less: several older unreleased entries now
describe two retired models rather than one. Known offenders still to re-read —
"Slots are bought, and storage has a ceiling again", the spots/rent entry, the plan
reprice entries, and the shop-panels entry whose "free weight on sale sits below a
line at the bottom" describes a WeightOffer row that no longer exists.

Released sections (1.3.0 and older) must still NOT be touched.
