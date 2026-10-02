---
# DVTD-82ln
title: A player's profile is assembled in one place
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:30:50Z
updated_at: 2026-10-01T18:42:15Z
parent: DVTD-y3vn
---

**What:** The public profile, the hover card and your own profile read one server-side assembly of who a player is.

**Why:** Three copies drifted: your own card showed no GitHub handle, and a standing was computed twice.

## Done when

- [x] One rule builds a player's face (name, border, worn titles, theme, authorship, rank) and the profile and hover card both use it
- [x] Your own profile shows the same card a visitor sees, handle included
- [x] An open run's standing is computed once for the profile and the card
- [x] The authorship-only read is gone

## Notes

profileFaceOf in account/profile/domain/profile.model.ts; Standing in run/community/domain/standing.model.ts; getAuthorship and useAuthorship deleted. Profile types move out of profileScreen.viewmodel into the domain model.


## Summary of Changes

- New domain model profile.model.ts: ProfileIdentity, ProfileFace, profileFaceOf, ProfileRecord, ProfileTotals, PublicProfile (types moved out of profileScreen.viewmodel).
- New run/community/domain/standing.model.ts: Standing + standingOf, replacing standingOf in publicProfile.service and runOf/PlayerRun in the player card. The unused band field is dropped.
- getPublicProfileService and getPlayerCardService both call profileFaceOf; playerCardViewFor maps a face to the card view.
- OwnProfile reads usePublicProfile(viewer.id); the look draft and archive stay on session reads. getAuthorship, getAuthorshipService, useAuthorship and userQueryKeys.authorship deleted.
- ADR-166 written; ADR-142 consequence updated; wiki Climbing now wording fixed; CONTEXT gains Profile face and Standing.
