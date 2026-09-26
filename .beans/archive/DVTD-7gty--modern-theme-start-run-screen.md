---
# DVTD-7gty
title: 'Modern theme: start-run screen'
status: completed
type: feature
priority: normal
created_at: 2026-08-23T16:36:22Z
updated_at: 2026-08-23T17:37:14Z
---

Storybook-only. Modern/Screens/Start: 7 configs dealt from 30, pick 3, suggested combo, paid rebuild, per-config locks, gate 0's stake on the right. No rarity bars.

- [x] Glyph: add the suggest path
- [x] Pick: draft variant + trailing slot
- [x] Action: full prop
- [x] screens/StartScreen.ui.tsx
- [x] StartScreen.stories.tsx
- [x] StartScreen.spec.tsx
- [x] Verify: tsc, stories typecheck, tests, lint, emitted CSS

## Summary of Changes

Storybook only, nothing routed. `Modern/Screens/Start` — seven configs dealt from thirty, pick three.

**Kit** — `Glyph` gained a `suggest` sparkle; `Pick` gained a closed `variant` (`remove` | `draft`, carrying wash + control colour + control shape + strikethrough together) and its `trailing` slot back for the padlock; `Action` gained `full`.

**New** — `screens/StartScreen.ui.tsx` + spec (19 tests) + stories (Fresh, Partway, Ready, NoCombo, Stripped, Elite).

**Decisions taken** — the draft control stays a real `<input type="checkbox">` under the round skin, since pick-three must announce itself as pick-three. The gate panel is flat and never folds; only the pipeline does. No rarity bars. The combo panel is a local element rather than `Control.ui.tsx`, which turns into a `<details>` the moment it gets a title. The disabled start button carries no tooltip — its label already reads "Pick 3 to start", and `Tooltip`'s `inline-flex` shell would have collapsed the full-width button back to its text.

**Derived** — picks, pips, "N to go" and the button's two labels all come off `pickedIds.length`.

**Verified** — tsc clean, stories typecheck clean, lint clean (731 modules), 303 passing. Emitted CSS hash changed (`app-CWLv_W9V` → `app-DYDRG2TX`) and every new class is present, so Storybook needs a restart. The 5 reds are the pre-existing `RewardScreen.spec.tsx` copy drift.

## Follow-up pass (same session)

Marciano's review of the built screen:
- clear-reward values are `Delta`/`Chip` badges, not plain toned text
- the pipeline fills as picks land (`Entry mark="idle"` per picked config, `Slot` for the rest) — it stayed all-empty before
- `picksRequired` deleted as a prop: it is now derived as the count of open slots, which is what it always meant
- "Clear rewards" reads at `size="label"`, not small-caps
- the note drops "a fresh mix every run · archive pays for a rebuild"
- the rebuild button carries a tooltip: "Paid from your archive, not from this run's storage."

Open, asked: the combo panel does not say *why* to take it. Options put to him — state the combined effect, offer several named starter combos, or teach the config families (multiplier / storage / action / gamble) and tag each dealt row.

## Second follow-up pass

- **Poll rail rows carry the family badge** beside the name, so a config looks the same wherever it appears.
- **`Family.ui.tsx` extracted** from StartScreen (+ spec, stories): `ConfigFamily`, `FAMILY`, `FAMILY_ORDER` and the tag now that two screens use them.
- **The deal rows adopted the poll rail's shape**: `Pick` gained `summary`/`explainer`/`defaultOpen`, mirroring `Entry`'s disclosure, and its name dropped to `text-xs` to match. The inline one-line description is gone; rarity and the full sentence live behind the caret.
- **`Caret` gained `scope`** (`fold` | `row`). Required, not cosmetic: the deal rows sit inside a `Fold`, and `group-open/fold` matches any open ancestor with that name, so a shared name would have rotated every row's caret whenever the fold opened.
- **Ticking and unfolding are separate targets**: the checkbox and name sit in a `<label>` inside the `<summary>` that stops propagation, so picking never folds.
- Fold title is **"Configure your pipeline"**; the pips and "N to go" are gone (the button still counts down).
