---
# DVTD-wh6k
title: Rename the shelf to the Registry
status: completed
type: task
created_at: 2026-09-10T09:57:00Z
updated_at: 2026-09-10T09:57:00Z
---

Marciano: 'rename "shelf" to Registry. Players "download" or "install" from the
"registry"'. The offer list is an npm registry; the shop is still the screen it
sits on.

- [x] `Shelf.*` → `Registry.*`, `ShelfControl.*` → `RegistryControl.*` (files + exports)
- [x] `ShopScreenProps.shelf` → `registry`
- [x] Player-visible strings: title, "Rebuild/Extend the registry"
- [x] `kantoPoll.factory` offer + control fixtures
- [x] Domain comments and test names in `src/modules/`
- [x] `docs/wiki.md` and a Retired-terms row in `CONTEXT.md`
- [x] lint, typecheck, tests

## Summary of Changes

124 occurrences across 16 kit files plus 9 domain files. Prose prepositions moved
with the noun: "on the shelf" became "in the registry", "off the shelf" became
"out of the registry".

`install` was already the verb: the offer badge's hint reads
`Install {config} · {price}`, `runAction.model` has an `install` transition, and
the upgrade panel's first card is labelled `installed`. So the metaphor was
already half in place and only the noun was wrong.

**Left alone, on the board/session precedent.** ADRs keep their historical
wording, including ADR-053's filename and its README row: the same repo left
"board" and "session" in ADRs after those renames, and only the wiki tracks
current rules. Story-local `const Shelf = () =>` helpers in terminal-theme and
old-theme are untouched too, since both kits are being replaced (old-theme is
DVTD-6crx).

**Not done, needs a decision:** the `draft` verb. `draftCost`,
`DRAFT_COST_PER_SLOT_KB`, `draftCostFactor`, `rollDraft`, `rebuildDraft`,
`shopDraft` and the `draft` shop action are ~300 occurrences across
`shop/domain/draft.model.ts`, `run/domain/shopAction.model.ts`, the config roster
and CONTEXT.md's symbol table. "Download" would fit the registry metaphor, but it
is a domain rename an order of magnitude bigger than this one, and `draft` also
names an unrelated poll status in `schema.ts`.

Verified: 3886 tests pass (220 files), lint + depcruise clean, tsc clean,
prettier clean, stories typecheck at the 30 pre-existing errors.
