# ADR-174: The worn swatch is part of the look

## Status

Accepted — 2026-10-02 (Marciano, DVTD-su6a). Amends
[ADR-144](144-a-look-is-one-face-saved-in-one-press.md): a look is a border,
titles and a swatch. Closes the UI half that
[ADR-142](142-the-profile-shows-what-others-see.md)'s swatch theme waited on.

## Context

`users.equipped_swatch_id` was read everywhere: the public profile, the hover
card and the climb ladder all wear `profileThemeFor`. But nothing could write
it. The press-to-wear path was deleted when the swatch moved into the drafted
look, and the draft never gained it, so your own page was pinned to pallet and
the only worn swatch in the database was the seed's.

## Decision 1: the swatch is drafted with the border and titles

`Look` carries `swatchId`. The appearance tab draws one swatch row beside the
borders and titles. **Save look** writes all three in one UPDATE, the same press
as before. An unearned swatch is drawn undiscovered, unnamed and unpressable.

## Decision 2: the draft themes your own page as you pick

Your own page, Dex tabs included, wears `profileThemeFor(draft.swatchId, owned)`,
so picking a swatch recolours the page before you save, as the face already
previews the drafted border. A visitor and the hover card read the saved swatch
only.

## Decision 3: pallet is stored as nothing worn

`storedSwatchIdOf` maps pallet, and any id that names no swatch, to `null`. So
"nothing worn" has one representation, and picking pallet after wearing nothing
leaves the draft clean. A swatch the player does not own is refused with
`swatch-not-owned`; pallet is everyone's and never refused.

## Consequences

Saving the look invalidates the profile and player card queries as well as the
archive and title state, so the hover card and your page catch up without a
reload.
