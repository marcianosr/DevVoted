---
# DVTD-ati1
title: Configs on /presentation and /admin are still coloured by rarity
status: todo
type: bug
priority: low
created_at: 2026-09-04T08:39:38Z
updated_at: 2026-09-04T08:39:38Z
---

`src/ui/rarityColors.ts` and a local table in `src/routes/_authed/admin.tsx` colour configs by **rarity**, an axis ADR-047 deleted in August. ADR-055 then keyed config hue to slot size everywhere else, so these two surfaces now disagree with the rest of the app.

Two live spots:

- `src/domains/economy/components/Cards/ConfigCard.ui.tsx:27` reads `RARITY_COLORS` from `~/ui/rarityColors`. Reachable from `/presentation` (the slide deck) via `src/presentation/componentRegistry.tsx:144,201`. This is the only *coloured* legacy config card left.
- `src/routes/_authed/admin.tsx:22-26`, applied at `:621`, has its own rarity table using generic Tailwind (`bg-blue-100`/`green`/`red`/`purple-100`) rather than the Kanto palette, on the admin config table.

Both run on legacy `src/domains/economy/data/configs`, which has its own config shape still carrying `rarity`. That is why they did not break when `ConfigFamily` was deleted: they never read the modules-layer `Config`.

Not urgent: `/presentation` is a slide deck and `/admin` is internal tooling, so no player sees either. Worth deciding rather than leaving: either repoint both at `sizeFill` from `~/ui/sizes` (needs a slots figure on the legacy config shape, which may not exist), or accept that the legacy deck illustrates a retired design and leave it alone deliberately.

`src/ui/rarityColors.ts` also feeds `src/ui/SwatchMark.component.tsx` and `src/domains/polls/utils/pollResult.ts`; check what those key it to before deleting the table.
