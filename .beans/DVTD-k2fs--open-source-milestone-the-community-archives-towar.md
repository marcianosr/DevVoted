---
# DVTD-k2fs
title: 'Open-source milestone: the community archives toward a shared goal'
status: draft
type: feature
created_at: 2026-09-29T17:02:47Z
updated_at: 2026-09-29T17:02:47Z
parent: DVTD-z2r2
---

**What:** A communal sink: players donate archived storage toward a shared milestone ("the community has archived 812 MB / 1 GB"), and crossing it pays everyone a cosmetic.

**Why:** A number that only sums balances is a readout, not a sink; a goal players pay into is the fun community thing Marciano sketched on 2026-09-29.

## Done when

- [ ] Decided: what a player donates from, and what the milestone pays (a seasonal swatch or title, never power)
- [ ] The community screen's header stats row states the shared progress
- [ ] Donating is a guarded archive debit like the warm boot's

## Notes

Parked 2026-09-29 while ADR-153 (the warm boot) was decided. Marciano: "not sure what this would really add, but it's a fun community thing". Facts today: no cross-player SUM over `users.archived_storage` exists; `seasons` has a table and no writer (ADR-100 refused seasons); the community header's `stats` row (`CommunityView.component.tsx`) is the natural host for a milestone figure; a donation would reuse `debitArchivedStorage` (run repository).
