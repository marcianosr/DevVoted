# ADR-029: Shop controls sit on three horizons — Rebuild, Lock, Extend

## Status

Accepted (2026-08-11, Marciano; DVTD-5lt6). Extends the shop of
[ADR-008](008-reward-shop-multibuy-coverage-gated-slots.md); the rebuild control
it renames was already live.

⚠ **Lock superseded by [ADR-054](054-offer-locks-ship-with-yarnlock.md)**
(2026-09-03): locking requires the yarn.lock config, holds any number of offers
for the rest of the run, and gained a free release action. Decision 1's Lock
bullet, Decision 4's Lock staging and the one-at-a-time cap are dead; Rebuild
and Extend stand.

## Context

Rerolling the shop's offers existed as one button ("Rebuild offers") with an
escalating price that resets each visit. The open question was whether steering
the offers should grow into a permanent meta-system paid for out of
account-level progression — a reroll count you own between runs.

Marciano rejected that framing: the shop itself should contain the controls, so
steering the offers is bought with the run's own storage and competes with the
configs on the table. Three controls were proposed and accepted (Rebuild, Lock,
Extend), and the design question became what each one's purchase actually buys.

## Decision

1. **Each control has a different lifetime, and that is the point.** Rebuild
   lasts the visit, Lock reaches the next shop, Extend lasts the run. Three
   buttons that all expired at the same moment would be three prices for one
   kind of decision.
   - **Rebuild** — rerolls the offers; price doubles per use, resets next shop.
   - **Lock** — pins one offer. Rebuilds skip it and it is still offered at the
     next gate's shop. Flat price, one at a time.
   - **Extend** — one more offer, in this shop and every shop after it.
     Escalating price, a small fixed supply per run.
2. **Lock is priced to bridge, not to hedge.** Storage only ever drains inside a
   shop — income comes from clearing gates — so wanting a config you cannot
   afford *yet* is the only reason to pay for one. A lock that expired on exit
   would be a variance tax on rebuilding; one that survives is a deposit against
   the next gate's payout. It is spent by installing the config, and until then
   it occupies one offer slot every visit, which is the rest of its cost.
3. **Extend is the strategic buy because build aim decides runs.** Measured
   earlier (see the build-aim vs build-count work): width self-cancels while
   aim swings win rate several-fold. More candidates per shop is a direct
   investment in aim, so it is the expensive control and the only permanent one.
   Priced per visit it would be a deal nobody takes, and an unpressed control is
   dead screen space.
4. **Gate progression stages the controls in.** The opening shop shows Rebuild
   only; Lock and Extend arrive a gate apart. This follows the staged-exposure
   stance of [ADR-026](026-staged-onboarding-starter-stacks.md) — the first shop
   already carries offers, upgrades, uninstalls and the plan ladder.
5. **Locks are ids, not remembered rolls.** The draft is derived state
   (`draftSeed` + a seeded PRNG in `draft.model.ts`) so a rehydrated snapshot
   reproduces the shop the player left. A lock therefore has to be a fact about
   the run (`RunState.lockedOfferIds`), and the roll composes around it, leading
   with the held offer so a pinned chip does not move between rerolls.
6. **Buying an offer takes two taps, and the price badge is the second one.**
   The offer's corner badge carries the whole flow in one spot (Marciano's mock):
   `32KB` → tap the card → the badge turns green and reads `install` → tap the
   badge → it settles into `✓ owned`. Tapping the card is free and repeatable;
   the only press that spends storage is aimed at a badge that states the price.
   This is the Balatro shop pattern (tap card → REDEEM appears), adopted because
   the first cut put two spending targets side by side with no confirm step: on a
   phone, brushing a chip spent up to 384KB with no undo, and the padlock sat
   directly beside it.
   - **The badge, not a button row beneath the chip.** An action row was built
     first and rejected: it grew the offers grid by a row on every selection, and
     the buy target moved away from the number it was spending. The badge already
     names the price and already sits at a fixed spot on the card.
   - **The armed chip fades; the badge stays opaque.** A corner badge overlaps the
     chip, and two surfaces at the same weight are illegible together — the first
     build of this was unreadable. So `ConfigChip` gained `dimmed`, the ring is
     what says "selected", and the solid thing inside the ring is the press that
     spends storage. A disabled badge is also solid-but-muted rather than
     translucent, since half-opacity celadon on a dark panel is mud.
   - **The lock is a second corner badge**, only on the selected offer, for the
     same reason — it spends storage, so it obeys the same "aim at a badge that
     names its price" rule instead of standing permanently beside every chip.
   - **Hover and selection are separate state** (`hoveredId` / `selectedId`):
     hovering inspects, driving the pipeline's ghost row; only a click arms the
     badge. One shared value would let a mouse travelling toward `install`
     re-target it at whatever chip it passed over.
   - **Offers stay selectable when unaffordable or the pipeline is full**, since
     a chip that refuses the tap cannot be read either. Owned offers are the
     exception: there is nothing left to decide about them, so their chip is inert.
   - **A refusal explains itself on the badge that refused**, in a tooltip
     ("No free slot — uninstall a config first", "Costs 128KB — you have 8KB").
     This requires the badge to be `aria-disabled`, not `disabled`: a disabled
     button fires no pointer events, so it can be neither hovered nor tapped for
     an explanation — `Badge` therefore drops the click and keeps the element live.
     `Tooltip` already pins on touch, which is what makes this work on a phone.
     Rejected: a red line under the offers (built first). It spent two lines of
     the panel answering a question the player had not asked yet, and it sat far
     from the thing that said no.
   - The mobile stack makes a local confirm necessary rather than merely nicer:
     `Columns` is one column below `md`, so the pipeline's own "Add X to your
     pipeline" row sits below the whole offers panel — off-screen at the moment
     of the tap.
7. **A block-level Lock was rejected**: it would need a pick-an-offer mode to say
   which offer it means. Prices and limits live in `draft.model.ts`; the viewmodel
   splits "staged in" (`lockAvailable` / `extendAvailable`) from "affordable now"
   (`canLock` / `canExtend`) so a broke player still sees the price.

Rejected: **"Widen"** as Extend's name. Width and widening are pipeline-slot
vocabulary ([ADR-025](025-automatic-width-claiming.md),
[ADR-027](027-gate-width-demand.md)); reusing them for the offer list would make
two unrelated numbers share a word.

Rejected: **account-level rerolls**. Progression bought outside the run cannot
trade off against the configs it is competing with.

## Consequences

- `finishReward` resets `rebuildsUsed` and not `lockedOfferIds` /
  `extensionsBought`. That asymmetry *is* the mechanic, so it is commented at
  the reset rather than left to be inferred.
- Extend appends one offer instead of re-rolling a wider draft: after any
  purchase this visit, a fresh roll would hand back a whole new shop.
- A lock the player never redeems keeps consuming an offer slot for the rest of
  the run. That is legible and self-inflicted, but it is the first thing to
  watch in playtest — if it reads as a trap rather than a bet, the alternative is
  expiry after one shop, which costs a new "expires" cue on screen.
- Extend partly refunds Lock's clog (a bought offer slot back), which makes the
  two controls combine rather than compete. Intended.
- **A bought offer stays on the table wearing "owned"** instead of vanishing:
  `draft()` no longer filters it out of `draftOptions`. The chip would otherwise
  disappear from under the finger that just tapped it, and the badge's third
  state needs something to sit on. It is unbuyable from there (the reducer refuses
  an owned config, and `canInstall` rules it out), and the next roll drops it,
  since drafts only ever offer configs the build lacks.
- `Badge` gained an optional `onClick`/`disabled`/`ariaLabel` and renders a
  `<button>` when pressed-able. Corner badges are siblings of the chip's own
  button, not children, so this nests no interactive elements.
- The two-tap rule is currently the shop's alone. The configure screen's bench
  installs on a single tap and has the same shape of risk; aligning it is
  follow-up work, not silently in scope here.
- A corner badge is a small target (~40×18px). That is acceptable here only
  because a mistap on the card itself now costs nothing — the risk moved from
  "spent 384KB" to "selected the wrong offer".
- Shared button padding (`px-3 py-1.5`, ~32px tall) is below the 44px touch
  target both platforms recommend. It applies to every shop button, so growing it
  is a design-system change rather than something to slip in under this ADR.
