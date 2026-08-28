---
# DVTD-d1ei
title: Unreleased CHANGELOG entries still describe the slot ladder
status: todo
type: task
priority: normal
created_at: 2026-08-27T19:17:44Z
updated_at: 2026-08-27T19:17:44Z
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
