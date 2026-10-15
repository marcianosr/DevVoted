# ADR-199: A pressed face opens the player's card

## Status

Accepted — 2026-10-15 (Marciano, DVTD-eqdl). Replaces [ADR-141](141-a-face-shows-the-player-and-leads-to-them.md) Decisions 2 and 3.

## Context

A face linked to the profile, and its card showed only on hover. A phone has no
hover, so a tap skipped the card. Worse, the tap's emulated hover armed the card's
JS timer before the link navigated, so Back restored the page with a card that could
not be closed.

## Decision 1: a press opens the full card as a popover

Clicking or tapping any face opens the player's full card in a native popover, with
a close button. Outside taps and Esc close it too. The name in the card links to the
profile. The face is a button, so a cmd-click no longer opens the profile.

## Decision 2: the hover card is CSS

Each face carries its own hover card. CSS shows it on hover or keyboard focus after
300ms, only for pointers that can hover and only where anchor positioning exists, and
places it with anchor positioning. JS only fetches the card, the first time a pointer
or focus reaches the face.
