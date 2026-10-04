# Lenses

## Lens map: where each rule's truth lives

| Focus | Wiki | Code owner |
|---|---|---|
| Shape of a run | §2.1 | `src/modules/run/run/domain/run.model.ts` |
| Gates | §2.2 | `src/modules/run/run/domain/runAction.model.ts` (`runReducer`) |
| Audits | §2.3 | `src/modules/run/incident/` |
| Polls, categories | §2.4 | `src/modules/run/poll/`, `src/modules/polls/` |
| Coverage, bands | §2.5 | `src/modules/run/build/domain/coverageRatio.model.ts` |
| Gate close | §2.6 | `src/modules/run/gate/`, ADR-157, ADR-159 |
| Victory, run end | §2.7 | `run.model.ts` |
| Unlocks | §2.8, §6.2 | `src/modules/collection/` |
| Build, slots | §3 | `src/modules/run/build/` |
| Configs, versions | §4 | `src/modules/run/config/` |
| KB, shop | §5.1, §5.2 | `src/modules/run/shop/`, ADR-155 |
| Archive, warm boot | §6.1 | ADR-153 |
| Words | §9 Glossary | `~/shared/lib/copy.ts` |
| Numbers | §10 | wiki blocks generated from models (`npm run docs:sync`) |

Get line numbers: `grep -nE "^#{1,4} " docs/wiki.md`. Memory notes flag known stale wiki prose (e.g. `wiki-2-6-floor-prose-says-day-code-says-window`); check before calling a mismatch.

## Balance

Question: can a build or play style win without the choices that should matter?

- Run the sim: `npx vitest run src/modules/run/build/domain/coverageRatio.model.spec.ts` (`describe("the balance this model exists to hold")`, 2000 seeded trials, BARE/DOUBLER/TRIPLER/STACKED × accuracy). Report each assertion pass/fail.
- Sweep (offer, don't assume): copy the spec's `simulate` into a scratchpad `.spec.ts`, loop builds × accuracy (0.5–0.95), `console.table` win rate and average gate. Run it with `npx vitest run <path> --root .` and delete it afterwards.
- Signals:
  - A build wins at poor accuracy (≤0.6) → 🔴: stacking beats knowing.
  - Two builds within a few points everywhere → 🟠: the choice is cosmetic.
  - Win rate jumps across one accuracy step → 🟠: a cliff.
- Trap: a unit threshold is divided by the multiplier; count effort in the raw share, never in units earned.
- Known gap: nothing models run income or the build-space curve (DVTD-8gns, DVTD-qkiq). Put it under "Not tested"; don't fake numbers.

## Fun

Question: does each press feel like a choice, and does the run pull you forward?

Play at least two runs with contrasting builds (e.g. blue's free eight vs agatha's risk configs, or two proto-run builds).
- Choice: on prep and in the shop, is one option always right? Would a good player ever pick the other?
- Tension: near a band edge, do you know what's at stake on the next poll?
- Reward: does the gate and review screen make the close feel earned? Is the KB gain legible?
- Variety: did the two runs feel different, or only number-different?
- Pull: at run over and on the hub, is there a reason to come back tomorrow?
- Dead time: screens you click through without reading.

Fun findings are 🟠 or 🟡, never 🔴. Name the moment and the feeling ("at gate 3 prep I had nothing to decide").

## Mechanics

Question: does the game do what the wiki and ADRs promise?

1. From the lens map, write the expected outcome as numbers before playing: e.g. "3/5 right at gate 2 with Code Coverage v2 → band X, KB Y".
2. Reproduce on the cheapest rig; record every press.
3. Compare screen vs expectation. Check the screen agrees with itself too (balance header vs shop figure vs review).
4. Edge cases worth one try each: all wrong, all right, exactly on a band edge, zero KB in the shop, a full build, an audit that disables a config.

Mismatch → 🔴 with both numbers and the source.

## UX

Question: can a new player tell what the screen wants and what just happened?

Prefer `blue@kanto.dev` or a fresh proto-run.
- 5-second test: from the snapshot alone, name the primary action. Can't → 🟠.
- Every figure has a label or badge; units stated (KB, slots, gate).
- States explain themselves: sealed, locked, sitting out, sold out, disabled by audit.
- Words match the glossary (§9); the same thing has one name across screens.
- After each press: visible feedback (balance pill, band change, toast).
- Phone: `resize_page` 390×844 (or `emulate`): no horizontal scroll, primary press reachable, nothing clipped.
- Keyboard: Tab reaches every press in a sensible order; focus is visible.
- Contrast: text on the screen's Kanto theme is readable (screenshot, judge).
- Console clean.
