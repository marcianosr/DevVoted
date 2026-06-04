---
# DVTD-5jkh
title: Sell colored display names (cosmetic meta-progression)
status: todo
type: feature
priority: normal
created_at: 2026-06-04T14:04:30Z
updated_at: 2026-06-04T14:04:30Z
blocked_by:
    - DVTD-enj5
---

Extend the cosmetic meta-progression beyond borders to **name colors**. Players spend archived storage to unlock solid colors / gradients / animated names, then equip one. Mirrors the border catalog/ownership pattern exactly — minimal new infrastructure.

## Why
- Borders are visual but limited to the avatar surface area. Name colors are visible everywhere the displayName renders (social proof, participant lists, dropdowns, gates minimap if we add names).
- More variety per archive-MB → better long-tail spending sink.
- Pairs naturally with the existing role-title display (Poll Editor / Admin) we just shipped — colored names + titles = "this player is somebody."

## Design (open)
- Schema: `users.equipped_name_color_id text`, `users.owned_name_color_ids text[]` — exact mirror of `equipped_border_id` / `owned_border_ids`.
- Catalog: `src/domains/economy/data/nameColors.ts` with `{ id, name, displayValue (hex | gradient | css), cost, rarity }`.
- Tiers (rough):
  - **common**: solid colors from existing Kanto palette (pallet, viridian, cerulean, …) — 200-500 KB each
  - **rare**: 2-stop gradients (e.g. cyan → magenta) — 1-3 MB
  - **epic**: animated gradients (CSS @keyframes hue rotate) — 5-10 MB
  - **legendary**: prismatic / per-letter cycling (the "prismatic" naming already exists for first-pick styling) — 20-32 MB
- Display: extract a `<UserDisplayName user={…}/>` component that consumes equippedNameColor and renders accordingly. Replaces literal `{user.displayName}` at all current call sites.
- Plumbing: add `equippedNameColorId` to the same query types we extended for borders (`CommunityStatsUser`, `ActiveRunPlayer`, `FallenRunPlayer`, voters).
- Shop UX: probably its own section on the profile page next to BorderShop — `NameColorShop` component.

## Considerations
- Animated names may distract from quiz content. Cap animation to "tile" contexts (social proof), drop to static color in dense lists (option-breakdown voter row).
- Accessibility: enforce min contrast against the dark background — refuse low-contrast palette additions at catalog level.
- Long display names + gradient: confirm CSS background-clip on truncated text behaves.

## Touchpoints
- `src/database/schema.ts` + migration (2 columns)
- `src/domains/economy/data/nameColors.ts` (new catalog)
- `src/domains/economy/api/nameColor.queries.ts` + handlers + server fns (mirror archive pattern)
- `src/domains/economy/hooks/useNameColorState.ts` + invalidation
- `src/domains/economy/components/NameColorShop.component.tsx`
- `src/domains/users/components/UserDisplayName.component.tsx` (new shared)
- All `displayName` render sites — swap to `<UserDisplayName/>` (search for `.displayName}` and `displayName ??`)
- Profile route: render NameColorShop next to BorderShop
- Query types in `communityStats.queries.ts` (already extended for borders) + active/fallen player query types

## Blocked by
DVTD-enj5 — same archive currency foundation as borders.

## Todo
- [ ] Lock pricing tiers + catalog seed list
- [ ] Schema migration (2 new columns)
- [ ] Query layer + transactional purchase (copy archive.queries.ts purchaseBorderTx)
- [ ] Server fns + handlers
- [ ] UserDisplayName component + swap call sites
- [ ] NameColorShop component + profile wiring
- [ ] Plumb equippedNameColorId through all user-bearing queries
- [ ] Accessibility check (contrast)
