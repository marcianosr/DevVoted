# ADR-142: The profile shows what others see

## Status

Accepted, 2026-09-29 (Marciano, DVTD-g1lo). Amends
[ADR-125](125-a-player-has-one-page-and-one-card.md) on the owner's tabs.

## Context

Your own page had two shelves, borders and titles, and "edit profile" opened the
first. Nothing on the page drew you the way another player meets you, and one
press on a border spent archive before you had seen it on yourself.

## Decision 1: one appearance tab

The border and title shelves share one owner tab, **appearance**. "Edit profile"
opens it.

## Decision 2: the tab leads with a preview

The preview draws three surfaces another player meets you on: your card as a
visitor sees it, your byline on a poll you wrote, and your climber card on the
climb map. All three come from one identity, the same one your own card reads, so
the preview cannot disagree with the card. The nav bar is left out: only you see
your own nav.

## Decision 3: a border is tried on before it is bought

Pressing a border's frame puts it on in the preview and nowhere else. Buy, wear
and take off stay on the button under it. The try-on is local to the tab: leaving
the tab, or buying or wearing any border, drops it.

## Consequences

- The owner's identity is the public profile's ([ADR-166](166-a-player-face-and-a-collection-count-have-one-owner.md)),
  so your card carries the GitHub handle a visitor sees.
- The climber card preview states no standing; the preview is about what you
  wear, not where you stand.
