# ADR-189: An advertisement states a true offer

## Status

Accepted — 2026-10-05 (Marciano, DVTD-sopp). D1 amended by ADR-193: the poll
editors card names a thin category and its bounty, and an admin sees it without a
reward.

## Context

Two ways to grow outside a run sit off its path: the 16 KB an approved poll pays
(ADR-185) lives in the nav, and the border market is an owner tab on the profile.
Players finish runs without meeting either.

## Decision 1: two advertisements, both true

An advertisement is **Looking for poll editors** or **one border for sale**. Every
figure on it comes from the game: the reward from the poll reward constant, the
border's name, price and description from the catalogue. A border is for sale when
the viewer does not own it and it is not earned by a win (the Champion border).
An admin never sees the poll editors card, because an admin's poll pays nothing.
Player-crafted listings wait for a marketplace where players sell to each other.

## Decision 2: the border is shown on the viewer's face

The icon of a border card is the viewer's own face wearing that border, so the card
is a try-on before the market.

## Decision 3: rolled after hydration, half and half

The pick is random each time a screen mounts: half the rolls advertise poll editors,
half a border, picked uniformly from what is for sale. The roll happens in an
effect, so the server and the first client render both draw no card and hydration
never disagrees. A seeded daily pick was considered and dropped: the ask was a
different border each time.

## Decision 4: dismissed per screen, per session

The × hides the card on that screen for the browser session (`sessionStorage`).
The poll screen draws a one-line strip with a link and no ×, so it never takes a
key press or the focus away from a timed poll.

## Decision 5: the signed-in user travels by context

Root provides the signed-in user through `ViewerContext`. A screen rendered without
it (every screen spec) draws no advertisement instead of needing a router or a
query client.

## Decision 6: each kind is one entry with a weight

The kinds of advertisement are a list. Each entry says when a viewer is eligible
and how heavily it weighs; the roll picks among the eligible entries by weight.
Poll editors and borders weigh the same, so the pick stays half and half. A new
kind, such as a marketplace listing, is one new entry and no new branching.
(Amended 2026-10-05, DVTD-n1kl.)

## Decision 7: a banner runs along the pages without a card

The pages that carry no advertisement card show it as a banner fixed to the bottom
of the screen, above the phone tab bar, over an opaque surface. The run, the
profile and the suggest form carry their own card or are where the card leads, and
the pages before sign-in have no viewer, so none of them draw the banner. Its ×
hides it for the session like a card's. (Amended 2026-10-05, DVTD-n1kl.)

