---
# DVTD-b37w
title: Cookies config card with install-time consent choice
status: in-progress
type: feature
priority: normal
created_at: 2026-05-29T08:18:05Z
updated_at: 2026-05-29T08:18:05Z
---

Add a 'Cookies' config card that opens a variant-picker dialog on install. Introduces a reusable variant mechanic for configs.

## Design

Three new entries in configs.ts:
- 'cookies-config' (shell): uncommon, 128KB cost, no effect, has variants[] field. Appears in shop.
- 'cookies-accept-all-config' (variant): 128KB cost, +512KB storage, exposes deck. Filtered from shop pool.
- 'cookies-reject-all-config' (variant): 128KB cost, +128KB storage, deck stays private. Filtered from shop pool.

Variants compose existing effects (expandStorage, exposeConfigDeck) — no new effect implementations needed.

## Tasks

- [ ] Add variants and variantOf fields to Config model
- [ ] Add cookies-config (shell) + two variant configs in configs.ts
- [ ] Filter variantOf-tagged configs out of selectRandomConfigs pool
- [ ] Create ConfigVariantDialog UI primitive (uses native dialog like ConfirmDialog)
- [ ] Wire ShopContainer to open dialog when a card with variants is installed
- [ ] Tests: shop filter excludes variants, dialog renders both choices, picking a variant installs the correct id
- [ ] Verify npm run build + npm test pass
