# ADR-044: Capacity is spots, money is KB

## Status

Accepted — 2026-08-27 (Marciano, DVTD-29cm). Replaces the one-meter model drafted
in the same session and abandoned before it shipped. Reverses
[ADR-043](043-rarity-is-a-shape-not-a-hue.md) Decision 6 (price = size, ladder
doubled). Supersedes [ADR-041](041-slots-open-on-gates-coverage-or-either.md) (the
slot ladder), amends [ADR-023](023-storage-capacity-is-a-subscription.md) /
[ADR-030](030-gate-staged-storage-plans.md) (the plan rents spots, not a KB cap),
[ADR-025](025-automatic-width-claiming.md) (width still auto-claims, from a
different ladder) and [ADR-037](037-a-missed-gate-peels-a-config.md) (the peel is
a share of spots, not a count). Cites pillar 2 of
[ADR-042](042-design-pillars-and-anti-pillars.md).

## Context

A config's grade already names a number of bits, and the pipeline already had a
width ladder measured in slots. Those were two unrelated scarcities: a `byte` and
a `bit` cost the same one slot, so the grade ladder priced nothing, and width had
to be balanced against depth as a separate axis.

Collapsing them onto **KB** was tried first and rejected. Configs multiply
coverage, coverage earns KB, and if KB also buys width then width buys coverage
buys width — a reinforcing loop with no brake. The fix is not to forbid buying
width; Balatro sells joker slots too. The fix is that width has a ceiling, and
that the ceiling is measured in something the score cannot inflate.

## Decision 1: capacity is spots, and the glyph's cell count is the price

A pipeline holds a number of **spots**. A config occupies as many as its grade has
bits: `bit` 1, `crumb` 2, `nibble` 4, `byte` 8. The mark a player already reads
(ADR-043) is now the cost, so the grade ladder finally prices something.

Spots are drawn as a track and **never written with a unit**. That is what keeps
them from colliding with KB, and it is why KB needs no rename.

## Decision 2: the first byte is earned, and only on gate clears

> ⚠ **Amended 2026-08-28 (ADR-045)**: live again, and wider — every rung is
> earned on a clear now, not just the first byte, and the plan that briefly owned
> width is gone.

> ⚠ Amended 2026-08-28 — see [the amendment below](#amendment-the-plan-sells-width-outright-2026-08-28-dvtd-ykix).
> Gate clears no longer grant spots at all; every spot is rented.

| Gates cleared | Spots | |
|---|---|---|
| 0–3 | 4 | a nibble is the biggest thing that fits |
| 4–7 | 6 | |
| 8–12 | 8 | a full byte |

Nothing else grants any of the first eight. The opening curve teaches the size
model, and a curve you can pay to skip teaches nothing.

## Decision 3: past a byte you rent, to a hard 24

> ⚠ Amended 2026-08-28 — the rungs are absolute widths now, not additions, and
> there are five of them. See [the amendment below](#amendment-the-plan-sells-width-outright-2026-08-28-dvtd-ykix).

A byte is the pipeline you **own**. Everything above it is rented from the storage
plan, billed every gate, and repossessed when a bill goes unpaid — the insolvency
rule ADR-023 already established, now taking back spots instead of a KB cap.

| Rung | Adds spots | KB cap | Bill / gate | From gate |
|---|---|---|---|---|
| free | — | 512 | — | 0 |
| a nibble of room | +4 | 768 | 24 KB | 2 |
| a byte of room | +8 | 1024 | 56 KB | 4 |
| a word of room | +16 | 1536 | 128 KB | 8 |

No rung opens on gate 5: that gate carries Read-only, and a rung the player can
see but cannot buy reads as a bug (ADR-030).

A rung is a bigger disk, so it carries both: room for configs and room to save.
Keeping the KB cap on the same rung leaves ADR-023's subscription intact rather
than inventing a second ladder beside it, and the seven rungs collapse to four
because spots are now the reason to climb.

`8 + 16 = 24` is the cap, and it falls out of the unit ladder rather than being
picked. Rent rather than purchase because rent self-corrects: width that stops
paying for itself unwinds on its own, which is the brake a one-off purchase does
not have.

The top rung is the number to watch. 16 rented spots at an affordable bill is the
snowball this ADR exists to prevent, and its bill is deliberately past ADR-030's
one-third-of-a-perfect-clear guidance.

## Decision 4: overflow is a screen, not a deletion

Losing a rung whose spots are occupied leaves the pipeline **over capacity**. That
is a legal, visible state: the engine never resolves it by deleting a config it did
not ask about (pillar 2).

It routes to the existing peel screen, which becomes one screen with two entrances:

| Entrance | Free up | Way out |
|---|---|---|
| Missed gate | a share of occupied spots | drop, or minify |
| Over capacity | the overflow | drop, minify, **or rent the room back** |

Renting out of an overflow is allowed; renting out of a peel is not, or missing a
gate would be free for a rich run.

## Decision 5: minify squeezes a config into a pipeline that cannot hold it

Minify halves a config's spots and halves what it gives, one way only. A minified
`byte` is 4 spots, so it fits an opening pipeline; a `bit` cannot be minified,
because one spot is already the floor and there is nothing to squeeze.

Halving a *bonus* means halving the part above one — `×1.25` becomes `×1.125`, not
`×0.625`, which would turn a bonus into a tax. A config's costs are never halved:
softening a throttle would make minifying a buff.

## Decision 6: the peel is a share of occupied spots

A count was meaningless once configs come in four sizes — "one config" took a
quarter of an opening build or a whole byte off a summit build for the same word.
The share also prices width honestly: eight bits pay a 20% peel with two bits and
keep six, while a lone byte has to minify to pay at all.

Nothing before gate 3 may peel more than half the build. Minifying everything
frees exactly half of what is occupied, so a quota inside that cap is always
payable without dropping anything, which is what stops a single-config opening
dying to its first miss. The guarantee is slack against today's 20% rows on
purpose: a retune cannot quietly break it.

## Decision 7: KB is untouched, and ADR-043's doubling is reverted

KB stays money and stays exactly what it is today: offers, upgrades, rebuild, lock,
extend, the git tag, the plan bill. No rename, no new sinks, no cap change.

`DRAFT_COST` goes back to 32 / 64 / 128 / 256. The doubling existed only to make
512 KB equal one byte exactly, and under this ADR the byte is 8 spots and KB never
measures capacity. Keeping it would mean doubling every faucet and every fee to
match: a re-denomination of the whole economy with nothing bought by it.

## Consequences

- Two currencies, and they cannot be confused, because only one has a unit
  written on it.
- The grade names are load-bearing. A `byte` costing 8 of 8 owned spots is a
  genuine dilemma at every point in a run: early it cannot fit at all, late it
  costs the whole build.
- Width is bounded, so no purchase can compound past 24. What remains is variance
  in *when* a run gets wide, which is a pricing problem and tunable.
- `Pipeline.slots` becomes a spot capacity, and `SLOT_UNLOCKS`'s eight
  gate-and-coverage grants collapse to three gate rungs. Coverage no longer buys
  width at all, reversing the axis ADR-041 restored.
- The Gate Dex advertises spots per gate instead of numbered slot unlocks.
- Watch in playtest: whether renting is ever correct. If the bills are right, a
  rung should be a real temptation around the gate it opens and a mistake two
  gates later. If nobody rents, the bills are too steep; if everybody holds a
  word by gate 9, the cap is doing no work.

## Amendment: the plan sells width outright (2026-08-28, DVTD-ykix)

Two sources of width read as one incoherent number in playtest. The shop's plan
panel had to say "14 spots" — six earned plus eight rented — and no row in it
explained where the six came from. Decisions 2 and 3 collapse into one ladder.

**The storage plan is the only source of spots.** A rung is the pipeline's whole
width, not an addition to it. Gate clears put wider rungs on sale; they hand over
no spots.

| Rung | Spots | KB cap | Bill / gate | From gate |
|---|---|---|---|---|
| free | 4 | 512 | — | 0 |
| 2 | 8 | 768 | 24 KB | 2 |
| 3 | 12 | 1024 | 56 KB | 4 |
| 4 | 16 | 1280 | 96 KB | 6 |
| 5 | 24 | 1536 | 128 KB | 8 |

What this changes:

- `ownedSpotsFor`, `nextSpotGrantFor` and the three-rung `SPOT_LADDER` are gone.
  `capacityFor(plan)` is `storagePlanFor(plan).spots`, and `BASE_SPOTS` /
  `MAX_SPOTS` are the first and last rungs.
- A clear no longer widens anything, so the width promise leaves the start
  screen's reward list, the shop's grant row (`SpotGrantRow`) is deleted, and
  `RunState.justGrantedSpots` with it.
- Insolvency drops the whole pipeline to the free four rather than to an earned
  byte. Over-capacity (Decision 4) is now reachable from any rung, and is the
  same screen.
- The Gate Dex advertises the rung a clear opens, never a grant of spots.
- A git tag's rescue carries its KB stipend and no width: a rescued run buys its
  own rung.
- The plan row leads with the width it sells; the KB cap rides along in its terms.

The 24-spot ceiling, the rent-not-purchase argument and the insolvency rule all
survive unchanged. What dies is the idea that a run *owns* any of its width, and
with it the opening curve Decision 2 defended: the free rung teaches the size
model instead, and it teaches it by being too narrow rather than by widening.

Watch in playtest: the free rung has to feel tight enough that the 8-spot rung is
tempting at gate 2 while its 24 KB bill still hurts. If a run never leaves the
free rung, the bills are too steep for a pipeline that is also paying for configs.

## Amendment: gates hand the width over, KB only hurries it (2026-08-28, DVTD-yu7z)

The amendment above lasted a few hours. [ADR-045](045-spots-come-from-gates-kb-rents-more-on-top.md)
keeps everything this ADR decided about *what* capacity is — spots, priced by the
grade's bit count, minifiable, peeled as a share — and changes where it comes from:

- **The gate schedule is width's only source.** A clear at a rung's floor hands it
  over free. The storage plan is deleted, along with the KB cap it rented and the
  per-gate bill; KB buys nothing but an early arrival at the next rung.
- **Decision 2's "the first byte is earned, and only on gate clears" is live again**,
  in a stronger form: every rung is earned on a clear, not just the first byte.
- **Over-capacity is now unreachable.** It existed because a rented rung could be
  repossessed. Nothing rents, so nothing shrinks — `isOverCapacity` survives as an
  invariant rather than a state the player resolves, and Decision 4's peel-screen
  resolution never fires.
- **The width-buys-score-buys-width loop stays cut**, by a different cut: money can
  bring a rung forward but can never reach past the last one, so no run gets wider
  than the schedule allows however rich it gets.
