---
# DVTD-n1kl
title: An advertisement banner runs across the pages without a card
status: completed
type: feature
priority: normal
created_at: 2026-10-05T10:38:30Z
updated_at: 2026-10-05T10:43:09Z
---

**What:** A cookie-style advertisement banner along the bottom of the pages that carry no advertisement card, drawn from one list of advertisement kinds.

**Why:** The poll list, the home page and the admin pages never show the poll reward or the border market, and a third kind of advertisement should be one new entry, not new branching.

## Done when
- [x] The pages outside the run, the profile and the suggest form show the banner
- [x] The banner sits above the phone tab bar and can be closed for the session
- [x] Each kind of advertisement is one entry with its own eligibility and weight
- [x] Which advertisement shows is unchanged: half and half, never poll editors to an admin

## Notes
- Builds on DVTD-sopp (PR #112).
- No player listings and no buying from an advertisement.

## Summary of Changes

Advertisement kinds are a weighted list of entries (eligibility + weight + pick); the pick is unchanged at half and half. A banner variant is fixed to the bottom of every signed-in page that carries no card, above the phone tab bar, closable for the session. ADR-189 decisions 6 and 7, wiki §6.5, CHANGELOG 2.0.2.
