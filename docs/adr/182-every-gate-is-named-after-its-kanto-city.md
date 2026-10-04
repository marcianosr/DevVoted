# ADR-182: Every gate is named after its Kanto city

## Status

Accepted — 2026-10-03 (Marciano, DVTD-ef7i).

## Context

The gate ladder spoke two vocabularies. Three gates were towns (Pallet,
Lavender, Seafoam) and the rest were gym badges (Boulder, Cascade, Thunder, …),
so a player read "Thunder Gate" next to "Lavender Gate" with no rule to learn.
The colours did not help: a gate's colour is its city's (Thunder wears
vermilion), so the screen showed one name and the colour said another.

## Decision 1: one name per gate, the city

Every gate and its swatch carry the name of the Kanto place the gate stands for,
in route order: Pallet, Pewter, Cerulean, Vermilion, Lavender, Celadon, Fuchsia,
Saffron, Seafoam, Cinnabar, Viridian, Indigo Elite, Champion. A swatch is the
gate's colour, so it takes the gate's name ("Pewter Swatch") rather than a
second word to learn.

Gate 11 is **Indigo Elite**: the place (Indigo Plateau), then who waits there
(the Elite Four). Gate 12 stays **Champion**.

## Decision 2: badges are flavour only

A gym badge may appear in copy ("win the Boulder Badge at Pewter") but never as
a gate's or a swatch's name. Badge trivia in the poll pool is quiz content and
is unaffected.

## Decision 3: the ids follow the names

The code says what the player reads. A swatch id is `swatch-<place>`
(`swatch-pewter`, `swatch-indigo-elite`) and a gate theme is `gate-<place>`
(`gate-pewter`). Both derive from one place name in the swatch roster, so they
cannot drift apart.

The theme takes a `gate-` prefix because nine of the city names are also Kanto
colour tokens, and cerulean and cinnabar already mean info and error. Without the
prefix `data-gate-theme="cerulean"` and `data-screen-theme="cerulean"` would
read as the same thing. The prefix is `gate-`, not `city-`, because Indigo Elite
and Champion are not cities.

Stored ids (`users.owned_swatch_ids`, `users.equipped_swatch_id`) are rewritten
by a guarded migration, so a player keeps every swatch they own or wear.

## Rejected

- **Cities for gates, badges for swatches.** Three gates have no gym, so their
  swatches would need invented badges, and a swatch would carry a second name
  for the same colour.
- **"Elite Indigo".** It reads as a shade of the colour indigo.
- **Renaming only the display names.** The code would keep saying `boulder`
  while players read Pewter, which moves the confusion into the codebase.

## Consequences

- Run screens, the Dex, the profile and the community board name gates by city.
- Gate names now coincide with colour names, so a spec cannot tell "the gate's
  name" from "a colour name" by text alone; it asserts the gate name directly.
