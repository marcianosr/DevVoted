---
# DVTD-5lt6
title: 'Shop controls: Rebuild, Lock, Extend'
status: completed
type: feature
priority: normal
created_at: 2026-08-11T13:59:45Z
updated_at: 2026-08-11T14:53:37Z
---

Promote the lone "Rebuild offers" button into a shop-controls block with three
controls, each on a different time horizon (Marciano, 2026-08-11):

| Control | Price      | Horizon         | Effect |
|---------|------------|-----------------|--------|
| Rebuild | 4/8/16/32… | this shop       | reroll offers (exists) |
| Lock    | 16KB flat  | into next shop  | pin one offer: rebuilds skip it, it survives leaving the shop |
| Extend  | 48/96KB    | rest of the run | offer list 5 -> 6 -> 7 |

Rationale: rejects a permanent meta-system reroll in favour of run-currency
shop actions. Three horizons make it a block rather than three buttons —
Rebuild is tactical variance, Lock bridges an unaffordable offer to a richer
shop (KB only ever decreases inside a visit), Extend is a compounding
investment in build aim (measured 5x win-rate swing vs width).

Constraints:
- Drafts are derived from `draftSeed(gatesCleared, rebuildsUsed)` for snapshot
  purity, so locks must be explicit state (ids), not remembered randomness.
- Not "Widen": width/widen is pipeline-slot vocabulary (ADR-025, ADR-027).
- Staged exposure (new-player complexity feedback): Rebuild from the first
  shop, Lock from gate 2, Extend from gate 3.

- [x] draft.model: lock/extend costs, offerCount, rollDraft honours locks + size
- [x] run.model: lockedOfferIds + extensionsBought state, lock/extend actions
- [x] finishReward carries locks and extensions, still resets rebuildsUsed
- [x] viewmodel exposes control availability + staging gates
- [x] ShopScreen: controls block (Rebuild, Extend) + inline lock on offers
- [x] tests: draft.model, run.model reducer, ShopScreen

## Summary of Changes

ADR-029 records the decision; CHANGELOG + wiki 5.2/numbers table updated (the wiki still claimed DRAFT_SIZE 3).

- `draft.model.ts`: LOCK_COST_KB 16 (flat, MAX_LOCKED_OFFERS 1), extendCost 48/96 (MAX_EXTENSIONS 2), offerCount, LOCK_FROM_GATE 2 / EXTEND_FROM_GATE 3. `rollDraft(seed, equipped, lockedIds, offers)` resolves locks from the roster and leads the draft with them; `draftSeed` takes a third input so an Extend draw cannot collide with the visit's main roll.
- `run.model.ts`: `lockedOfferIds` + `extensionsBought` on RunState (both optional for old snapshots, both absent from finishReward's reset -- that asymmetry is the mechanic). `lock-offer` leaves the current draft untouched; `extend-offers` appends one offer instead of re-rolling wider. Installing a held config spends its lock.
- Shop UI: controls block holds Rebuild + Extend; the padlock rides on its own offer chip (a block-level Lock would need a pick-an-offer mode). Viewmodel splits staged-in (`lockAvailable`/`extendAvailable`) from affordable (`canLock`/`canExtend`).
- Wired on both routes: `/run/shop` and the `/proto-run` playtest harness.

Verification: 1402 passed (+38 new), lint + depcruise clean, build + tsc clean. The 26 failures in the suite are identical to HEAD (verified in a throwaway worktree) -- pre-existing, none in shop-control files.

Open playtest risk: an unredeemed lock keeps eating an offer slot for the rest of the run. If that reads as a trap rather than a bet, the alternative is expiry after one shop, which costs a new on-screen cue.

## Follow-up: two-tap buying (2026-08-11)

Marciano flagged mobile misclicks: the offer chip (32-384KB) and the padlock
(16KB) were adjacent spending targets with no confirm step. Adopted the Balatro
pattern he pointed at (tap card -> REDEEM appears).

- Tapping an offer only selects it. `Install <price>` and the padlock button
  appear under that chip and nowhere else.
- Buttons hug the selected chip, so the pointer never crosses another offer to
  reach them. `hoveredId` (inspect -> ghost row) and `selectedId` (commit) are
  separate state for the same reason.
- Offers stay selectable when unaffordable/full; the Install button carries the
  refusal and names it. Tooltips never fire on touch, so the reason had to be on
  the button, not on the chip.
- ADR-029 decisions 6-7 record it; CHANGELOG + wiki 5.2 updated.

Deferred, both noted in ADR-029: the configure screen's bench still installs on
one tap, and shared button padding (~32px) is under the 44px touch target.

## Follow-up 2: the badge is the button (2026-08-11)

Marciano's mock replaced the action row with badge states on the chip itself:
`32kb` (price) -> tap card -> green `install` -> tap badge -> `owned`.

- `Badge` gained optional onClick/disabled/ariaLabel, rendering a <button>.
  Corner badges are siblings of the chip's button, so nothing nests.
- Selected offer wears a celadon ring; its corner holds the green `install`
  badge plus the padlock badge. No action row, so no layout growth on select.
- `draft()` no longer removes the bought offer from draftOptions -- it stays
  reading "owned" (inert chip) until the next roll drops it.
- A refused selection states why in one line under the grid, since a disabled
  badge cannot open a tooltip and touch never does.
- Superseded the action-row cut from Follow-up 1.

## Follow-up 3: legibility of the armed badge (2026-08-11)

The green `install` badge overlapping a solid chip was unreadable.

- `ConfigChip` gained `dimmed`: the selected offer's chip fades to 40% so its
  corner badges read as buttons on top of it. The celadon ring carries "selected".
- `Badge`'s disabled state is solid-but-muted (zinc-700/zinc-300) instead of
  `opacity-50` -- half-opacity celadon on a dark panel is mud, and this badge sits
  over a chip so it must hold its own contrast.

## Follow-up 4: refusals explain themselves on the badge (2026-08-11)

Dropped the red refusal line under the offers; the reason is now a tooltip on the
badge that refused.

- `Badge`'s `disabled` renders `aria-disabled` and drops the click, NOT the
  `disabled` attribute: a disabled button fires no pointer events, so it could be
  neither hovered nor tapped for its explanation. Styling moved to
  `aria-disabled:` variants.
- `Tooltip` already pins on touch (pointerup, non-mouse), so tapping the greyed
  install/padlock opens the reason on a phone.
- The padlock badge also carries a tooltip now: what a hold buys, or its price
  when unaffordable.
- Reason copy shortened ("No free slot — uninstall a config first") since the
  tooltip is anchored to the offer it refuses.
