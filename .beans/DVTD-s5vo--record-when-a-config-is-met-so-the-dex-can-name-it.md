---
# DVTD-s5vo
title: Record when a config is met, so the Dex can name it before it is earned
status: todo
type: feature
created_at: 2026-09-24T14:10:27Z
updated_at: 2026-09-24T14:10:27Z
parent: DVTD-z2r2
---

**What:** Write a reveal ledger the first time a config is offered to you in a shop or read in a rival's build, and show a met-but-unearned config in the Dex as a dimmed named chip with its effect withheld.

**Why:** ADR-050 has three Configdex states, and the middle one has no data: nothing records that you have met a config, so the Dex jumps from ??? straight to earned.

## Done when

- [ ] A table records user, config and when it was first met, with what met it
- [ ] The shop roll and reading a rival's build both write it, idempotently, inside the action that showed the config
- [ ] The Dex Configs tab shows a met config as a dimmed named chip whose (i) opens its unlock paths
- [ ] The tab's footer states the rule: name shows once met, effect once earned

## Notes

Design parent is DVTD-2try. The chip already exists: DexConfigChip has a met state rendered only in Storybook (2026-09-24). This bean feeds it.

Reveal is account-level and free (ADR-050 Reveal / Grant / Stage). "Met" means seen on a shelf, bought or not, and since ADR-101 a rival's build is public, so reading one counts too.

Write seams to consider: the run action that opens a shop (the draft roll is deterministic from run state, so every offered id is known at that seam), the new-run registry, and the server functions that hand a rival's build to prep and the community board. Same idempotent upsert pattern as awardGateSwatch and grantObjectiveUnlocks.

Guarded SQL migration per ADR-012.
