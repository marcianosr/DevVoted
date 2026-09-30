# ADR-144: A look is one face, saved in one press

## Status

Accepted, 2026-09-29 (Marciano, DVTD-fdmd). Amends
[ADR-142](142-the-profile-shows-what-others-see.md) D1 to D3 and
[ADR-143](143-the-shelf-reads-as-a-ladder-a-table-and-a-grid.md) on the worn slots.

## Context

The appearance tab drew you three times (card, byline, climber card) and every
press on a border or title saved on the spot. Three previews said one thing, and
you could not settle on a look before other players saw it.

## Decision 1: one face

The appearance panel draws your card once. The byline and climber previews are
gone: every surface draws the same border and titles, so one face says it.

## Decision 2: a look is a draft until you save it

The panel lists your owned borders (with Default) and your earned titles. Picking
either changes only the draft; the card at the top of your page and the panel's
face both wear it. **Save look** writes border and titles together in one update,
so a look is never half saved. The server refuses an unowned border, an unearned
title, or more titles than the cap.

## Decision 3: borders and titles get their own tabs

**borders** is the shop: every border, owned ones marked owned, locked ones priced.
Pressing a locked border tries it on; the price becomes a buy press. A bought
border lands in the draft, not on your card. Pressing an owned border picks it.
**titles** is the shelf's ladder, table and grid, for progress only. Wearing a
title happens in appearance and nowhere else, so ADR-143's worn slots are gone.

## Consequences

- The tabs are owner tabs on the profile, not Dex tabs: the collection context
  never imports the profile.
- Leaving the page drops an unsaved draft.
