---
# DVTD-b37w
title: Cookies config card with install-time consent choice
status: completed
type: feature
priority: normal
created_at: 2026-05-29T08:18:05Z
updated_at: 2026-05-29T08:23:16Z
---

Add a 'Cookies' config card that opens a variant-picker dialog on install. Introduces a reusable variant mechanic for configs.

## Design

Three new entries in configs.ts:
- 'cookies-config' (shell): uncommon, 128KB cost, no effect, has variants[] field. Appears in shop.
- 'cookies-accept-all-config' (variant): 128KB cost, +512KB storage, exposes deck. Filtered from shop pool.
- 'cookies-reject-all-config' (variant): 128KB cost, +128KB storage, deck stays private. Filtered from shop pool.

Variants compose existing effects (expandStorage, exposeConfigDeck) — no new effect implementations needed.

## Tasks

- [x] Add variants and variantOf fields to Config model
- [x] Add cookies-config (shell) + two variant configs in configs.ts
- [x] Filter variantOf-tagged configs out of selectRandomConfigs pool (treats shell as owned when any variant is held)
- [x] Create ConfigVariantDialog UI primitive (uses native dialog like ConfirmDialog)
- [x] Wire ShopContainer to open dialog when a card with variants is installed + isConfigInstalled helper so shell flips to installed once any variant is picked
- [x] Tests: shop filter excludes variants, isConfigInstalled handles shell+variant case, cookies data shape covered (dialog UI not unit-tested - straightforward markup, verify in browser)
- [x] Verify npm run build + npm test pass

## Summary of Changes

**Model** (config.model.ts): Added ConfigVariant type, Config.variants on shells, Config.variantOf on variant targets.

**Data** (configs.ts): Three new entries - cookies-config (shell, 128KB, uncommon, no effect, two variants), cookies-accept-all-config (+512KB storage + exposes deck), cookies-reject-all-config (+128KB storage, private).

**Shop pool** (configSelection.ts): selectRandomConfigs now excludes any config with variantOf AND treats a shell as owned when any of its variants is in activeConfigIds. So once the player picks, the shell stops re-appearing on rerolls.

**UI** (ConfigVariantDialog.component.tsx): New dialog mirroring ConfirmDialog native dialog.showModal pattern. Lists each variant as a clickable card with label + description.

**Install flow** (ShopContainer.component.tsx): Intercepts install - if config has variants, opens dialog instead of installing directly. Chosen variant id reaches existing addConfigToRunServerFn, no server changes needed.

**Permanence guard** (configManager.service.ts): Added isConfigInstalled(run, config) helper - true if config id OR any variant id is in activeConfigIds. canAddConfigToRun uses it, shop card installed badge reflects it. Without this the shell would have stayed clickable after picking, letting player install both variants.

**Tests**: configSelection.spec.ts (new) covers variant filtering + shell-as-owned logic. configManager.service.spec.ts extended with isConfigInstalled cases + shell-already-installed guard. configs.spec.ts extended with cookies data shape + applyEffects assertions for both variants.

**Not done**: in-browser verification (requires DB + auth + shop-roll RNG luck for cookies to appear). UI follows the existing ConfirmDialog pattern - recommend manual smoke test before merging. Asset /configs/cookies.png not added; image field is optional per the model.
