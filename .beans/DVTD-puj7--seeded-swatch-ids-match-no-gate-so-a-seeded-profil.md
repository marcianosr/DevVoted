---
# DVTD-puj7
title: Seeded swatch ids match no gate, so a seeded profile reads zero gates
status: todo
type: bug
priority: normal
created_at: 2026-09-26T18:38:54Z
updated_at: 2026-09-26T18:38:54Z
parent: DVTD-u35m
---

**What:** Seed the gate swatch ids the swatch model actually defines, and validate them the way title ids are validated.

**Why:** Three of the four seeded ids are palette colours rather than gate themes, so the seeded account's gate collection reads as entirely unearned.

## Done when

- [ ] The seeded ids match the ones the gate swatch model defines
- [ ] An unknown swatch id fails the seed loudly, as an unknown title id already does
- [ ] A seeded account's gates-cleared count is non-zero on its profile

## Notes

Found while building the profile's public totals (DVTD-w70d). `src/database/seed/cast.ts`
seeds `ownedSwatchIds: ["pallet", "pewter", "cerulean", "vermillion"]`, but
`src/modules/run/gate/domain/swatch.model.ts` ids are `swatch-${theme}` and
`pewter`/`cerulean`/`vermillion` are not `SwatchTheme` values at all — they are
Kanto palette colours.

So `gatedex()` matches nothing for that account: the Swatches tab reads as fully
unearned and the profile's "N of 13 gates" total reads 0.

`src/database/seed/index.ts` already throws `Seed names unknown title <id>` for an
unknown title. Swatch ids get no such check, which is why this slipped in silently.
The same guard belongs on the swatch list.
