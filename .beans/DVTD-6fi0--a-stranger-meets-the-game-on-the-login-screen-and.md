---
# DVTD-6fi0
title: A stranger meets the game on the login screen, and a shared link credits DevVoted
status: completed
type: feature
priority: high
created_at: 2026-10-08T13:13:40Z
updated_at: 2026-10-08T14:10:58Z
parent: DVTD-erjz
---

**What:** The login screen says what DevVoted is before it asks for GitHub, a pasted link previews the game under its own name, and the admin's reminder email opens the run.

**Why:** Every channel we post in lands a stranger on a bare login form, and every pasted link credits the framework template's author.

## Done when
- [x] A logged-out visitor reads what the game is above the GitHub press
- [x] The GitHub press is the one primary action and the dev-only fields stay out of the way
- [x] A line under the press opens the public wiki until guest play lands
- [x] A pasted devvoted.dev link names no one but DevVoted
- [x] The admin reminder email opens the run and describes it
- [x] The login screen has a Story

## Notes
- Branch feat/login-pitch in the devvoted-growth worktree, off v2.3.0.
- The three leaks were found 2026-10-08: the reminder body linked /daily-poll (no such route), seo.ts carried @tannerlinsley as twitter:creator and twitter:site, and / sent a stranger to a login form whose whole copy was Username, Password, Continue with GitHub.
- ADR-178 is amended in the same change: the community header counts guests apart from account holders.
- Game-design reason for the Story: this is the first screen a stranger sees, and whether they press GitHub is decided here.

## Summary of Changes

- Auth.ui.tsx: wrapped in a pewter narrow Screen; a Welcome block (Logo, the headline "Five developer polls a day.", one paragraph in the game's own words) renders when the component is given a welcome; the GitHub press wears the action tone and comes first; the dev-only submit press follows the retry press; a caption link under the presses opens the wiki. The header meta says GitHub signs you up and in, owned by the ui COPY, so the subTitle prop is gone and Login.component passes welcome with the wiki path instead.
- Auth.stories.tsx (Login, Redirecting, NoSuchAccount, SignUp) and Auth.spec.tsx (5 specs on the pitch, the link, the press states and the retry).
- seo.ts: the template's twitter:creator and twitter:site (@tannerlinsley) removed; the og and twitter title, description and image tags stay.
- admin.service.ts: REMINDER links to /run with a 2.0 body and the subject "Today's five are up".
- ADR-178 Decision 3 amended (guest count on the community header) and its sign-in sentence no longer mentions a reminder opt-in.
- docs/growth.md written; DVTD-3ahx created for the weekly post; DVTD-ckbl unfrozen; DVTD-nr8f and DVTD-erjz carry today's decisions.
- Verified: tsc 0, lint clean (two pre-existing warnings elsewhere), prettier clean, auth specs 15/15. Full suite result recorded on completion. Not committed.

### Follow-up, same day

Marciano's review: the GitHub press wears the kit's new github icon and the primary tone; the pitch shrank to two lines in the title and caption variants; the head gained a player-written description, keywords, the site name, the canonical URL, his name as author and a rendered preview image at /brand/og.png (twitter creator handle still to be given). The spoiler fold on the wiki is its own bean.

### Superseded, same day

The pitch block above the panel was replaced by DVTD-yqq6: a two-column hero with a poll card that answers itself. Auth.ui.tsx is back to the plain panel (GitHub press with icon and primary tone, header hint); the wiki link and the copy moved to LoginScreen.ui.tsx. The link and head fixes from this bean stand.
