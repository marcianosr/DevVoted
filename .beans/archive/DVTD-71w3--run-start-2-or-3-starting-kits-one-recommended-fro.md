---
# DVTD-71w3
title: 'Run start: 2 or 3 starting kits, one recommended from the run''s input'
status: scrapped
type: feature
priority: high
created_at: 2026-08-24T12:12:16Z
updated_at: 2026-09-03T09:16:32Z
parent: DVTD-kulw
---

Run start should offer 2 or 3 starting kits and recommend one of them, with the
recommendation derived from the run's input rather than hardcoded. Mechanics still
to be designed; this bean is the design first, the wiring second.

## Where it stands today

- `STARTER_STACKS` (`src/modules/run/config/domain/stack.model.ts`) is three fixed
  stacks: React (`.js`/`.jsx`/Code Coverage), TypeScript (`.js`/`.ts`/ESLint),
  Full stack (`.vue`/`.java`/`.git`). Contents never vary by run.
- `recommended: true` is a static field on the TypeScript stack. It was picked once,
  for a first-time player, because it is the only stack with a real defense
  (ESLint's cross-out) per ADR-026 Decision 7.
- `StartView.component.tsx` maps the same three stacks to `StartCombo`s, and the
  dealt hand on the start screen is literally the union of their members
  (`dealtFromStacks`). So today the kits define the hand, not the other way round.
- Picking is one atomic `pick-stack` action; selection is derived from pipeline
  contents (`stackMatching`), never stored. That part should survive any redesign.

## The design question: what is "the input"?

Three candidates, and the choice decides what the recommendation teaches:

- **A. The hand the run dealt you.** Kits stop being fixed lists and become
  compositions over the drawn configs, so a kit is only offered if its members are
  in the hand. Needs the random start-of-run draw (DVTD-30k6, still draft) and
  inverts today's dependency: hand first, kits second.
- **B. Today's polls.** The run is a daily seeded shared run, so the window's
  category mix is knowable at start. The recommendation then reads as information
  about the day ("today leans TypeScript"), which is the most legible of the three.
  Decide first whether previewing the day's category mix is something we want to
  give away before a single answer.
- **C. The player's own record.** Per-category accuracy already exists in
  `src/modules/collection/dex/domain/polldex.model.ts`. Recommending on it means
  deciding whether we play to strengths (comfortable, converges runs) or to gaps
  (grows knowledge, which is the actual point of the game).

These are combinable, and B plus C is the pairing worth pricing: the day supplies
the categories, the record breaks the tie. A is a prerequisite question rather than
a rival if the hand becomes random.

## Rules any answer has to respect

- **A recommendation is a hint, not a solver.** ADR-026 Decision 7 made it a small
  badge for a first-time pick. If the badge starts reliably naming the best kit, the
  pick stops being a decision and the screen becomes a Continue button.
- **Comparable risk across kits** (ADR-026 Decision 5): no kit may carry a harsher
  unconditional check than its siblings, so difficulty is not smuggled into whichever
  kit looked most appealing. This is harder to hold when kits are generated, and needs
  a check in the generator, not in a curated list review.
- **Names state the real category** (ADR-026 Decision 6). A generated kit still needs
  an honest name, which is the main argument for composing kits from category-led
  templates rather than picking three configs that fit.
- **"Build your own" stays one tap away** (ADR-026 Decision 1).

## Naming, decide before building

Three words are already in play for this one thing: `StarterStack` in the domain,
`StartCombo` in the UI, "kit" in the prompt. ADR-026 rejected "pack" precisely to
avoid a fourth noun. Pick one, rename the rest.

## Todo

- [ ] Pick the input (A, B, C, or a pairing) and say what the badge claims in words
- [ ] Decide 2 kits or 3, and whether the count is fixed or depends on the hand
- [ ] Settle the one word for a kit, and rename `StarterStack`/`StartCombo` to match
- [ ] Define how a generated kit gets an honest name and a comparable check surface
- [ ] Record the outcome as an amendment to ADR-026 (its Decisions 1, 5, 6, 7 all move)
- [ ] Wire it: kit assembly in `config/domain`, recommendation in the view model, badge unchanged

## Reasons for Scrapping

Superseded by ADR-052 (DVTD-ez37, 2026-09-03): the answer to "which inputs drive the kit recommendation" became "no kits". Starter stacks are deleted everywhere; the recommendation survives as recommendedPicks(hand, maxSlots) preselecting 3 of the dealt 5 into the build. The naming collision this bean flagged (StarterStack / StartCombo / kit) died with the code.
