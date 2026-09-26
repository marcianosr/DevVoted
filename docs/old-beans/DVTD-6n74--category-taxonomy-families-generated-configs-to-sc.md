---
# DVTD-6n74
title: 'Category taxonomy: families + generated configs to scale categories'
status: draft
type: feature
priority: high
created_at: 2026-07-06T11:44:43Z
updated_at: 2026-07-06T11:45:36Z
---

Design spec for adding categories (Vue, Spring Boot, Angular, Django, Rails, Architecture) without the current per-category authoring explosion. Result of a grill-me session.

## Problem

Adding categories (Vue, Spring Boot, Angular, Django, Rails, Architecture) breaks the current model because each category is treated as an indivisible hand-crafted unit: its own Kanto color, its own 3 hand-authored configs (name + image), its own everything. Symptoms: running out of Kanto colors, config explosion (~47 hand-typed objects in `economy/data/configs.ts`), poll scarcity fears, and "grouping masks mastery" worries.

## Root cause

One problem in six costumes: a category is treated as atomic. Fix = decompose each category into a cheap *generated* part and an optional *bespoke* part.

## Resolved design (from grill-me session)

### Scoring = leaf
- Mastery / coverage / leaderboards stay per-leaf category. "Good at React" stays true.
- Content is not the bottleneck (polls authored constantly), so no need to pool polls via groups.

### Groups ("families") = cosmetic namespace only
- A **family** = opt-in color-sharing for kin. Its only job: stop related techs from each burning a scarce hue.
- Families NEVER score. They provide: color family + shop bucket + config-flavor bucket.
- A 1-leaf family is valid (todays system = every family has one leaf). Group ONLY where kin exist.
- Hard limits: family <= ~5 leaves (shade legibility), total families <= palette (~13). Nowhere near either.

### Family layout (starting point, adjustable)
| Family (hue) | Leaves |
|---|---|
| JavaScript | js, ts, react, vue, angular |
| HTML | html (solo, own hue) |
| CSS | css (solo, own hue) |
| Ruby | ruby, rails |
| Python | python, django |
| Java | java, springboot |
| Foundations | git, architecture, general-frontend, general-backend |

- Merge only where a color would otherwise be wasted (ruby+rails, python+django, java+springboot, js family).
- HTML/CSS stay solo/iconic because they are the web-platform substrate, belong to no language family, and have no kin needing their color.

### Role facet = badge, not bucket (2nd dimension)
- `language | framework | markup | tooling | concept`
- e.g. Rails = Ruby-family / framework; CSS = CSS-family / markup; git = Foundations / tooling; architecture = Foundations / concept.
- Language-vs-framework is a badge/filter/icon in the shop, NOT a group.

### Colors
- Family picks a hand-curated Kanto hue. Leaf gets a **procedural shade** within the hue (oklch lightness/chroma ramp by index).
- Adding a new family = 1 hue. Adding a new leaf = 0 color authoring.

### Configs = generated, not authored
- 3 mechanical templates (common +2% coverage/+0.3 weight; boost +1.1 weight; nerf -1.1 weight).
- `generateConfigs(leaves)` = templates x leaves. Adding a category adds 0 config objects.
- Tier-1 flavor = auto file extension (`.vue`, `.py`) from an `ext` field per leaf.
- Boost/nerf flavor = auto `Boost {name}` / `Nerf {name}`, with OPTIONAL bespoke override per (leaf,tier) for charm (e.g. `!important`, `"use strict"`). New category ships instantly playable; charm is later polish.

### Deferred decision
- **Framework -> language cross-credit** (does a Django poll credit Python?): ship PURE leaf-scoring now (no cross-credit). Additive to add later; a migration to remove. Live data will show if "deep Django / empty Python" feels wrong.

## Implementation sketch

- Introduce a **category registry** (replaces flat `CATEGORY_CODES`/`CATEGORY_METADATA` in `src/domains/shared/categories.ts`), per leaf: `{ code, name, family, role, ext, flavorOverrides? }`.
- `CategoryCode` union stays the source of truth for scoring types (`runCategoryCoverage`, leaderboards, `categoryWeight.service.ts`, borders).
- Derive family list + colors from the registry; move color assignment from ad-hoc Kanto usage to family-hue + procedural leaf-shade.
- Replace hand-written `economy/data/configs.ts` per-category configs with `CONFIG_TEMPLATES` + `generateConfigs(leaves)`. Keep the generic non-category configs (targetCategories: []) as-is.
- Add `vue, springboot, angular, django, rails, architecture` to registry with family/role/ext. Architecture: role=concept, no ext, generic flavor.
- Update `DEFAULT_CATEGORY_WEIGHTS` to derive from registry (avoid the manual 0/1 TODO list).

## Todo
- [ ] Design category registry shape ({ code, name, family, role, ext, flavorOverrides? })
- [ ] Migrate `categories.ts` from flat lists to registry; keep `CategoryCode` union derived from it
- [ ] Family -> hue mapping + procedural leaf-shade util (oklch ramp)
- [ ] Replace per-category configs with CONFIG_TEMPLATES + generateConfigs()
- [ ] Derive DEFAULT_CATEGORY_WEIGHTS from registry (remove manual TODO list)
- [ ] Add 6 new leaves (vue, springboot, angular, django, rails, architecture)
- [ ] Verify leaderboards / coverage / borders still type-check against derived CategoryCode
- [ ] (Deferred) framework->language cross-credit rule
