---
# DVTD-eqdl
title: Player card sticks open after Back on mobile
status: completed
type: bug
priority: normal
created_at: 2026-10-15T08:08:51Z
updated_at: 2026-10-15T08:23:26Z
---

**What:** Tapping a face on a phone, then going back from the profile, opens that player's card over the page and it cannot be closed.

**Why:** The card blocks the community board on mobile until the page is reloaded.

## Done when
- [x] Going back from a profile shows no player card
- [x] Clicking or tapping any face opens the player's full card with a close button
- [x] On desktop, hovering a face shows the read-only card; a touch never does
- [x] The name in the full card leads to the profile

## Notes
A tap fires an emulated mouseenter, which arms the 300 ms hover-intent timer in PlayerHover.component.tsx. The face is a plain anchor, so the page goes into the bfcache with the timer pending; Back restores it and the timer fires. The card is pointer-events-none and touch never fires mouseleave, so it sticks. First fix (hide on click and pagehide) replaced: a pressed face now opens the full card in a popover instead of navigating, and the hover card is CSS for hover-capable pointers. Decision in ADR-199.

## Summary of Changes

Each face (PlayerFace in Climber.ui.tsx) is a button that opens the full card in a native popover with a close button and the profile link on the name. Its hover card sits beside it and is shown by CSS in app.css (.player-hover-card): hover-capable pointers and keyboard focus only, 300ms delay, anchor-positioned. JS only fetches the card on first pointer or focus, through a slot context filled by PlayerCards.component.tsx. Removed the PlayerHover provider, its timer, tooltipPlacement and PlayerCardTooltip. Climb map chips get the hover card and keep their own Loot/File card. ADR-199 replaces ADR-141 D2 and D3.
