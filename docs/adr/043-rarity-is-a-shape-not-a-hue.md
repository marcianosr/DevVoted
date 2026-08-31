# ADR-043: Rarity is a shape, not a hue

## Status

> ⚠ **Superseded by [ADR-047](047-a-configs-size-is-a-number.md)** (2026-08-30):
> the grade ladder is deleted. A config carries a plain `slots` number instead.

Accepted — 2026-08-27 (Marciano, DVTD-ym11). Supersedes [ADR-006](006-session-run-mechanics.md)
Decision 9 ("Rarity is a loot tier shown as glow, never fill"). Renames the four
grades in data, copy and UI, and doubles the draft-cost ladder. Cites pillar 4 of
[ADR-042](042-design-pillars-and-anti-pillars.md).

## Context

Rarity was four hues — cerulean, viridian, cinnabar and a gradient — keyed by a
legend row on the deal and both shop shelves. Every one of those hues already
belongs to a gate swatch (Pallet, Cerulean, Celadon, Cinnabar, Lavender), so a
grade and a gate spoke the same colour about different things. In the shop a
`nibble`'s red bar sat in the same row as a red `Uninstall` press.

Colour was not the only doubled encoding. A config row already carries a status
dot (ADR-040) and, once opened, a level. The two obvious alternative marks both
lie: a filled rounded square reads as a gate swatch, and a partially filled meter
reads as a level.

The tier names were also the one vocabulary in the game that was invented rather
than borrowed. `common / uncommon / rare / legendary` is loot-game language, which
pillar 4 (real tools, real names) exists to avoid.

## Decision 1: the grades are named for the bits they hold

`bit / crumb / nibble / byte` — 1, 2, 4 and 8 bits. The names are real units, and
because a nibble *is* four bits the glyph's cell count is the grade's own
definition. The mark teaches itself.

The type keeps the name `Rarity` and the accessor keeps `rarityOf`. The brief
called the values "tiers", but a tier is already a storage-plan rung (wiki §5.1),
and a second meaning for it would be the vocabulary problem again.

## Decision 2: the mark is a cell cluster, achromatic

> ⚠ **The achromatic half is reversed by the amendment below (2026-08-28)**: the grade wears a hue again. The cluster, the cell count and the fixed slot all stand.

One SVG, `viewBox="0 0 16 16"`, cells 2.6 square with a 1.0 gap, centred so the
four grades read as one family. `RarityGlyph` owns it. Three rules:

- **Never an empty cell.** An empty slot makes it a progress track, which is the
  level bar's job.
- **Fixed slot** (22px in rows, 36px in Dex headers) so the name column stays
  flush across grades.
- **One neutral grey, no per-grade brightness step.** The cell count already
  carries the ladder — a byte is eight times a bit's ink — so intensity would
  state the same fact twice, and a lone bit cell stays legible at the 40% dim an
  unpicked row wears.

Every rarity-to-hue mapping is deleted: `RARITY_BORDER`, `RARITY_FILL`,
`RARITY_TEXT`, `RARITY_WASH`, the `rarity` arm of `Dot` (and with it the `bar`
shape, which had no other caller), `ConfigChip`'s coloured borders, and the ghost
row's grade-coloured outline. `app.css`'s `.legendary-*` classes stay — swatches,
the prismatic upgrade button and `Badge`'s tone use them for things that are not
config rarity.

## Decision 3: level is a separate mark, and it does show its track

`LevelBar`: segments 7×3 with 2px gaps, one per `maxLevelOf`, filled to `level`.
Unlike the grade glyph it draws its empty segments, because a level is a distance
along a known ladder and the room left is what you are buying. The empty track
sits darker than the glyph's cells, or a level-1 bit reads as one smear.

It renders only beside the upgrade press. The facts line under an opened config
keeps the words (`level 1 · ×1.25 · sells for 32 KB`): that line is read as a
sentence, not scanned as a gauge.

## Decision 4: the ladder is taught once, in the Dex

> ⚠ **Partly reversed by the amendment below (2026-08-28)**: the grade's name is back in the last column of the deal and the shop shelf. There is still no legend row.

No legend row anywhere. The Dex's Configs tab is the only surface that states a
grade in words, and its section headers carry glyph, name, odds, size and count
together. The grade word leaves the facts line, the shop shelf, the deal, the
`ConfigChip` tooltip and the in-gate rail — the rail renders no grade mark at all,
since storage and grade are not actionable mid-gate.

## Decision 5: the printed odds are derived from the weights

`RARITY_WEIGHT` (60 / 25 / 12 / 3) is the mechanic; `RARITY_ODDS` quotes what it
produces, rounded, in one notation: `1 in 2 / 1 in 4 / 1 in 8 / 1 in 33`. The
design brief carried a second set of odds (1 in 3 / 1 in 8 / 1 in 25 / 1 in 100)
chosen beside the weights rather than from them, which would have printed a number
a shelf spends against that the roll never honours — pillar 2. A spec asserts the
two tables agree, so a retuned weight cannot silently orphan its odds.

**The draw is still grade-blind.** `rollDraft` is a partial Fisher-Yates and
`startingHand` a uniform shuffle; the weights exist and are printed, but nothing
rolls against them yet (DVTD-5ljh).

## Decision 6: a config's price is its size

> ⚠ **Reversed by [ADR-044](044-capacity-is-spots-money-is-kb.md)**: the price is KB and the size is spots, two separate ladders. `DRAFT_COST` goes back to 32 / 64 / 128 / 256, and the grade's bit count becomes the pipeline's price instead.

`DRAFT_COST` doubles to 64 / 128 / 256 / 512 KB, so the free disk's 512 KB holds
one byte, or eight bits, exactly. That arithmetic is the point of the doubling and
it is what the storage-as-the-only-meter work builds on.

Faucets are unchanged, so the run is tighter than before: gate 0 pays 32 KB
against a 64 KB bit, which leaves the first shop unaffordable. If this ships alone
for longer than a playtest, `GATE_REWARD_KB` (32 → 64) restores every ratio
exactly.

## Consequences

- Colour in the run means gate, status, or a figure's sign. Nothing else.
- A row carries two marks that cannot be confused: a round dot for status, a cell
  cluster for grade, and neither needs colour to be told from the other.
- `RarityStripe` and `RarityWord` are deleted. `Legend` survives with no rarity
  key — the storage bar's caption is its next caller.
- Doubling the prices made a byte's 512 KB collide with the free plan's 512 KB cap
  in a shop spec. That collision is the intended arithmetic, not a bug; the
  assertion is scoped to the plan ladder.
- Watch in playtest: with no legend and no word on any run surface, a new player
  meets the glyph before the Dex explains it. The count is meant to be legible
  without the vocabulary (more cells, rarer) — if it is not, the fix is a Dex
  prompt, not a legend back on the shelf.

## Amendment: the grade wears a hue and a word again (2026-08-28, DVTD-voxv)

The last Consequence above named its own trigger, and the playtest hit it. The
shape stands — the cell count is still the grade's definition, and there is still
no legend row — but the achromatic rule in Decision 2 and the no-word rule in
Decision 4 are reversed.

What changed underneath is [ADR-044](044-capacity-is-spots-money-is-kb.md): the
grade IS the pipeline's price now, not a loot tier. A price is the figure on a row
a player finds before reading anything else, and one neutral grey was not that.

- `RARITY_TONE`: bit pewter, crumb cerulean, nibble lavender, byte saffron. Grey,
  blue, purple, gold is the ramp every game has already taught, so it needs no
  legend either. It colours the glyph, the run of cells, the grade word and the bar
  the config occupies on the spot track — the four marks that state a config's
  size. Never a row wash, and nothing else.
- **The track's bar takes it as an outline and a label, not a fill.** (The byte's
  outline became the legendary ring later the same day — see the second amendment.)
  A tinted bar
  competes with the installed/free/over-capacity fills the track already uses to
  say what kind of room a cell is; `border-current` lets one tone class do the
  grade without touching that. Over capacity replaces the grade colour outright,
  because a state outranks a grade.
- **Cinnabar and celadon stay out of the ladder.** They mean uninstall-or-refusal
  and recommended everywhere else in the kit, which is the half of the Context
  above that still holds. The gate swatches do own pewter, lavender and saffron;
  that collision is the price of this reversal, and it is bounded by colouring
  only the grade's own mark.
- The grade's name returns to the last column of the deal and the shop shelf. It
  is the word every refusal is phrased in ("needs a byte"), so the column teaches
  the vocabulary the rest of the game speaks. (The shelf lost it again later the
  same day — see the second amendment. The deal keeps it.)
- Hovering the mark states the price in spots ("takes 4 of 14 spots"). That is the
  Dex prompt the Consequence asked for, moved to where the decision is made.

## Amendment: the shelf drops the word, the byte keeps the ring (2026-08-28, DVTD-il1e + DVTD-510f)

Two same-day playtest calls, both narrowing the amendment above rather than undoing
it. The ramp, the cluster and the cell count all stand.

- **The grade word leaves the shop shelf; the deal keeps it.** A shelf row already
  carries a price and a press, and the word was the third mark on it saying the same
  thing the glyph in front of the name says. Deal rows carry neither, so the column
  still teaches the vocabulary there. `RowFigures.grade` is optional now. Its `needs`
  prop went with the word: a config that will not fit greys its price and names the
  gap on the press, which is where the player is reaching anyway.
- **A byte's bar on the spot track wears `.legendary-ring`.** Decision 2 reserved the
  `.legendary-*` classes for things that are not config rarity; the top grade is the
  exception, because it is the tier that was called legendary and the ring is the
  finish players already read as "the best one". It is the grade's own mark, so the
  bound in the amendment above still holds. `border-transparent` goes with it, since
  the ring paints a masked `::before` and a coloured border beside it reads as two
  edges. The ring means "requirement met" on a press and "top grade" on a bar; a bar
  is not a press, and the kit already lets swatch fills share the class.
- **A minified byte keeps the dotted edge instead.** The ring paints over the border,
  and the border is what says minified — a fact about the room the config takes,
  which outranks a finish.
