---
# DVTD-pmja
title: A category name is a badge, and it is spelled out
status: completed
type: task
priority: normal
created_at: 2026-09-26T13:22:23Z
updated_at: 2026-09-26T13:35:15Z
---

**What:** Wherever a poll category is named in player-facing prose it wears a badge and its full name, never an abbreviation.

**Why:** A linter config reads "JS/TS polls", an abbreviation the game uses nowhere else, while the community board already badges the same noun. One category, two readings.

## Done when

- [x] A category named in prose renders as a badge that takes no colour of its own
- [x] No player-facing string spells a category short
- [x] A linter states the categories it works on in full
- [x] The upgrade panel and the dex hint read a category the same way the config chip does
- [x] The docs say categories are colourless rather than plain text

## Notes

Colourless is the point: hue means gain, loss or term everywhere else in the kit, and a category is a noun. `CategoryLeader.ui.tsx:109` already renders `<Badge>{category}</Badge>` with no colour — this matches it.

`Figures` grows a category arm beside its band arm. Case-sensitive, so the lower-cased gate-mix ledger ("javascript 2") is deliberately left alone, and so a proper noun that is not a category reference (a title like "CSS Maintainer", a border called "Ruby Gem") stays safe if it ever reaches the parser.

Category names stop being hand-typed: `describeConfig`/`givesOf` gain an `eliminatesWrongOptionsFor` branch over `CATEGORY_METADATA`, matching what `focusCategory` already does, and `categoriesWord` stops upper-casing the code.

Touches ADR-020 Decision 1 ("plain text labels ... never a chip") and adds a Decision 4 to ADR-066 recording why a closed case-sensitive vocabulary is safe where the word "free" was not.

## Summary of Changes

`Figures` gained a category arm beside its band arm, built from `CATEGORY_METADATA`, sorted longest-first and matched case-sensitively. A category renders as an uncoloured badge — `toneOf` already fell through to `undefined`, so only `isBadged` needed an `isCategory` branch.

`describeConfig` and `givesOf` gained an `eliminatesWrongOptionsFor` branch that joins category names, so ESLint and Stylelint stop carrying authored copy the way the eleven Focus configs already did. `categoriesWord` stopped upper-casing the raw code, which fixed "JS or TS only" and "waits for JS or TS" in one place.

The upgrade panel and the dex hint panel now read their description and unlock captions through `Figures` too — both were stating the same sentence as bare prose directly beside a badged one.

Copy: the roster's `.js`, `.ts` and ESLint strings, two unreleased changelog entries, the wiki's roster Effect rows and its ADR-066 bullet. ADR-020 Decision 1 narrowed from "plain text labels, never a chip" to "colourless, wearing the neutral badge" — its reason, one palette spent on two meanings, is untouched by a badge with no colour. ADR-066 gained Decision 4 recording why a closed case-sensitive vocabulary is admissible where the word "free" was not.

Five `PollScreen` assertions moved off `getByText("TypeScript")`: a non-foldable chip states its description unconditionally (`stated = foldable ? infoOpen : true`), so a `.ts` config on a TypeScript poll puts the word on screen three times. They now anchor on the poll's meta row.

Verified: 3966 tests pass (206 files), `npm run lint` clean including dependency-cruiser and `docs:check`, `tsc --noEmit` clean, prettier clean.

## Deferred

- `Config.description` is required but shadowed for every Focus and linter config now — a field nothing reads. Worth its own bean.
- `PollScreen.ui.tsx` / `PollResult.ui.tsx` carry a `categoryColor?: KantoColor` prop no viewmodel supplies. It is dead, and a coloured category is the one thing ADR-020 forbids.
