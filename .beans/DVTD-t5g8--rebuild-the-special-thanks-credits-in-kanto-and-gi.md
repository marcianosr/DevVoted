---
# DVTD-t5g8
title: Rebuild the Special thanks credits in kanto, and give them a home
status: todo
type: feature
priority: normal
created_at: 2026-09-23T12:15:58Z
updated_at: 2026-09-23T12:15:58Z
---

`SpecialThanksPanel` + `CreditList` were deleted in DVTD-6crx as dead code (zero importers). The credits themselves should come back — the deletion was cleanup, not a decision to stop crediting people.

## Why it went orphaned

Not neglect: **its host page is gone.** `CreditList`'s own docstring reads "The credits blocks on the stats page: poll editors, and special thanks", and there is no `/stats` route in `src/routes/` any more. The panel outlived the page it was written for.

The same disappearance left another loose end: `AppFooter.ui.tsx` still has an optional `statsLink` slot that nothing passes.

## Recover the old render

    git show 3df71fde:src/modules/account/profile/presentation/CreditList.ui.tsx
    git show 3df71fde:src/modules/account/profile/presentation/SpecialThanksPanel.component.tsx

`CreditList` took `{ title, people }` and was built for **two** blocks — poll editors and special thanks — so whatever replaces it should stay that general. Note the poll-editor half may already be served: the community screen surfaces editors as gym leaders.

`getUsersByDisplayNames` in `profile.serverfn.ts` survived the deletion and is currently orphaned, so the data path is intact — nothing new to query.

The three credited names were hardcoded in the component: Matthijs Groen, Piet de Vries, Sander van Maurik.

## Open question, answer first

Where does it live? Options, roughly cheapest first:
- a panel on the profile page (the aggregate the code already sat in)
- a new `/credits` route, and point the footer's dead `statsLink` slot at it
- fold it into the footer itself, which already carries the authorship line

## Work

- [ ] Decide the home
- [ ] Rebuild `CreditList` as a kanto `.ui.tsx` (Panel + Climber/Author + Link — `Climber` already draws a photo+border chip, and `Author` already draws a handle with a GitHub-style byline, so this may not need a bespoke component at all)
- [ ] Re-wire `SpecialThanksPanel` as Tier 2 over `getUsersByDisplayNames`
- [ ] Mount it somewhere reachable, and verify `lint:dead` no longer calls it orphaned
- [ ] Either fill or remove `AppFooter.statsLink`
