---
# DVTD-ef7i
title: Every gate is named after its Kanto city
status: completed
type: task
priority: normal
created_at: 2026-10-03T17:25:42Z
updated_at: 2026-10-03T19:25:31Z
parent: DVTD-erjz
---

**What:** Rename every gate and its swatch to the Kanto city it stands for (Boulder becomes Pewter, Cascade becomes Cerulean, and so on), so no badge name is left as a gate name.

**Why:** Today the gate list mixes towns (Pallet, Lavender, Seafoam) with badges (Boulder, Cascade, ...), so one list speaks two vocabularies and players have no rule to learn.

## Done when

- [x] Every gate a player sees is named after a city, in game order: Pallet, Pewter, Cerulean, Vermilion, Lavender, Celadon, Fuchsia, Saffron, Seafoam, Cinnabar, Viridian, Indigo Elite, Champion
- [x] A swatch is named after its gate's city, so a gate and its swatch never carry two names
- [x] A player who already owns or wears a swatch keeps it after the rename, in production and locally
- [x] Badges survive only as flavour text (for example "win the Boulder Badge at Pewter"), never as a gate's name
- [x] The wiki, the changelog and the screens all use the city names

## Notes

Decided 2026-10-03: all cities, rather than cities for gates and badges for swatches. Reasons: three gates are towns with no gym (Pallet, Lavender, Seafoam), so a badge split would need made-up badges; and a swatch is the gate's colour, so a second name only adds a word to learn.

Mapping (gate, now, then): 0 Pallet → Pallet · 1 Boulder → Pewter · 2 Cascade → Cerulean · 3 Thunder → Vermilion · 4 Lavender → Lavender · 5 Rainbow → Celadon · 6 Soul → Fuchsia · 7 Marsh → Saffron · 8 Seafoam → Seafoam · 9 Volcano → Cinnabar · 10 Earth → Viridian · 11 Elite → Indigo Elite · 12 Champion → Champion.

Rename the ids too, not only the display names. If only `gateName` changes, the code keeps saying `boulder` while players read Pewter, and the confusion just moves into the codebase.

Where the names live:
- `src/modules/run/gate/domain/swatch.model.ts`: `SwatchTheme` union, `GATE_SWATCHES` (`gateName`, `theme`, id `swatch-${theme}`)
- CSS gate themes behind `data-gate-theme` / `data-swatch-theme` in `src/styles/app.css` (never run prettier on that file)
- Stored data: `owned_swatch_ids` and `equipped_swatch_id` in `src/database/schema.ts` hold `swatch-boulder` etc. The profile theme (`DEFAULT_PROFILE_THEME`, `profileTheme.model.ts`) is a `SwatchTheme` too. Check whether that one is stored as well.
- Needs a guarded migration under `supabase/migrations/` (ADR-012) that rewrites the stored ids. Best done before launch (DVTD-erjz), while there's little real player data.
- Specs and stories use the badge ids (`Screen.spec`, `Header.spec`, `PollScreen.spec`, `ProfileScreen.spec`, `ClimberCard.spec`, `Lead.spec`, `BandLadder`/`BandOutcomes` stories with `CASCADE_*`, `RegistryControl.stories` "Reach Cascade").
- `src/test/kanto.ts` badge trivia stays. It is quiz content, not gate naming.

Decided 2026-10-03:
- Gate 11 is "Indigo Elite": the place (Indigo Plateau), then who waits there (the Elite Four). Its swatch is "Indigo Elite Swatch". "Elite Indigo" was rejected because it reads like a shade of the colour indigo.
- Theme ids get a `gate-` prefix (`gate-pewter`, `gate-cerulean`, `gate-indigo-elite`, `gate-champion`), because pewter, cerulean, vermilion, celadon, fuchsia, saffron, cinnabar, viridian and indigo are also Kanto colour tokens (cerulean = info, cinnabar = error). Not `city-`, because Indigo Elite and Champion are not cities. Swatch ids stay `swatch-<city>` (`swatch-pewter`), since `swatch-` already tells them apart from colours, so the id stops being derived as `swatch-${theme}`.
- Record the decision in an ADR (naming) when this is picked up.

## Summary of Changes

- The swatch roster derives both ids from one place name: swatch-<place> and gate-<place> (ADR-182).
- The gate theme selectors in the stylesheet were renamed; the colours did not change.
- A guarded migration rewrites owned and worn swatch ids in place, keeping order; a spec checks it against the roster. Applied to the local database.
- Seeds, specs, stories and factories use the city names; badge trivia in the poll pool is untouched.
- Wiki section 6.3 and its prose, ADR-182 and the changelog (Changed) are updated.
