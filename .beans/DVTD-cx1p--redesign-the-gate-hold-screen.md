---
# DVTD-cx1p
title: Redesign the gate hold screen
status: completed
type: feature
priority: normal
created_at: 2026-09-27T08:35:18Z
updated_at: 2026-09-27T09:00:55Z
---

**What:** The held-gate screen leads with the settlement instead of the debrief, and storage can top up whatever the dropped configs leave owed.

**Why:** Settling the peel is the only thing a player can act on at a held gate, and it sits below four panels of history. Paying from storage is offered but wired to nothing.

## Done when

- [x] Storage settles the peel remainder after drops, through the domain
- [x] The settle panel leads the held screen and the debrief collapses under it
- [x] A config is picked for dropping with a checkbox
- [x] Every figure on the screen wears a badge
- [x] A secondary press stands small beside a wide primary
- [x] The wiki no longer says the peel is drop-only

## Notes

Decisions taken up front: storage tops up the remainder (not all-or-nothing); checkbox replaces the armed drop badge; the restructure is held-gates-only; the small/wide press pairing extends to the confirm dialog and the cleared-gate footer.

Two reversals to record: the checkbox was rejected on 2026-09-11 as not a kit idiom, and the cleared footer reverses the two-or-more aside rule.

## Summary of Changes

The `strip` action took a `fromStorage` flag. It drops the chosen configs, then settles whatever slots remain at the peel rate, as far as the balance reaches. The remainder is worked out in the reducer, so the quote on screen and the charge cannot drift. `PEEL_KB_PER_SLOT` moved into the domain rules to make that possible.

The held screen reordered: the settle panel sits under the header, the five recap folds moved into one shut column under a **What happened** heading. Cleared gates kept their two columns.

`Pick` is a new kit primitive, worn by both payment paths. `SlotTrack` fills took an optional colour so the settlement bar can name storage, dropped configs and overpay in one track, with the legend drawing only the sources that carry a slot.

A drop is now quoted in the slots it frees rather than in `sellRefund`. Those had drifted: three configs override their draft cost and one drafts free, so the screen said dropping it settled nothing while the domain freed its slots anyway.

Two asides now stand beside the press instead of taking a row above it, and the confirm dialog pairs a small cancel with a wide confirm.

ADR-126 written, ADR-117 decision 6 amended, wiki peel rules corrected, changelog entry added.

## Follow-ups

`minifyForPeel` is now the third way to pay that no screen offers. Either surface it or delete it.

The overpay penalty is softer: a funded player buys exact change instead of losing a slot. Wants a playtest before the numbers are trusted.
