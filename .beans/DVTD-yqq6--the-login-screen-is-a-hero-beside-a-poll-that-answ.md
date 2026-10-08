---
# DVTD-yqq6
title: The login screen is a hero beside a poll that answers itself
status: completed
type: feature
priority: high
created_at: 2026-10-08T14:00:03Z
updated_at: 2026-10-08T14:51:11Z
parent: DVTD-erjz
---

**What:** A logged-out visitor lands on a two-column screen: the headline, a short pitch, three figures, the GitHub press and a hint on the left; on the right a poll card from the kit that picks an answer, fills its coverage bar and slides to the next poll on its own.

**Why:** A bare form shows a stranger nothing; a poll answering itself shows the game in five seconds, before anything is asked of them.

## Done when
- [x] The left column reads headline, pitch, figures, GitHub press, hint, in the kit's type and colours
- [x] The right column is the kit's poll card with a category badge, a counter, a question, keycap choices and the coverage bar
- [x] The card picks an answer, holds the verdict, grows the coverage bar and moves to the next poll, in a loop, with no press needed
- [x] Reduced motion shows the card answered and still
- [x] A phone stacks the columns and the press stays full width
- [x] Sign-up keeps the plain panel; the dev-only email form still works in development
- [x] Story and specs

## Notes
- From Marciano's mock, 2026-10-08: "This would be 1000x cooler as a login screen. Can you use the actual components and design system? I do like the animation of answering polls. Forget guest mode for now."
- Supersedes the pitch block of DVTD-6fi0 on the same branch.
- The players-answered-today row waits for a public count; no fake faces.

## Summary of Changes

- loginDemo.viewmodel.ts (application, pure): three static demo polls (JavaScript, CSS, Git) with backticked code labels; DEMO_BEATS 1100 / 1650 / 220 ms; FIRST_STEP, SETTLED_STEP, nextStep, waitFor; demoCardFor builds the card (counter from SLICE_WINDOW, coverage from rungAt(1) and bandFor, picked ids and the right option state once answered, leaving and revealed flags); heroFor states the figures from SLICE_WINDOW and VICTORY_GATE.
- useLoginDemo.hook.ts (presentation): a setTimeout chain per phase, cleared on unmount; reduced motion settles on the first poll answered, set in the effect so the server and client first render match.
- LoginScreen.ui.tsx: cerulean wide Screen that rises; two columns from the hub grid, stacking under md; headline with the accent line in the theme colour, pitch, Badge figures, lg full-width primary GitHub press with the github icon, hint, wiki link; the poll card as a Panel keyed per poll wearing poll-card-enter, poll-card-leave and poll-card-revealed, with the category Badge, the counter, a saffron today's poll Badge, the kit Question (no onPick) and the CoverageBar in the footer; the dev email panel renders only when handed in.
- Login.component.tsx passes heroFor(), demoCardFor(step), the GitHub press, the wiki path and the dev form only in development. Auth.ui.tsx is back to the plain panel.
- Stories: Idle, Picked, Leaving, SecondPoll, Reduced, Redirecting, Phone. Specs: viewmodel (7), hook with fake timers (3), screen (6); Auth spec trimmed to the panel.
- Skipped on purpose: the players-answered-today faces row (no public count for a signed-out visitor).
- Verified: tsc 0, lint and depcruise and docs:check clean, prettier clean, auth module 29/29, full suite green. Not committed. Five files in the tree belong to another session's poll-link work.

### Follow-ups, same day

- Development switch: a Segmented (Email | GitHub) in the hero's press slot, email first; production has no switch and only the GitHub press. The dev panel under the grid is gone.
- The site root renders the hero for a signed-out visitor (index.tsx keeps the redirect to /run for a signed-in one), so a shared devvoted.dev link lands without a second redirect; /login still works.
- Head: html lang=en, og:image width/height/alt and twitter:image:alt; public/robots.txt allows the public pages and disallows the signed-in ones. Verified: tsc 0, lint clean, auth + shared specs 55/55.

- Mock match, same day: figures are outlined pills (bright bold value, soft label; HeroFigure { value, label } in the viewmodel); the GitHub press is width fill at a new kit Button size xl (min-h-16, text-xl, size-6 icon; all five size maps extended).

- Second mock pass: bare ground, the grid centred in the screen's floor, a local hero heading (text-4xl/5xl) and a soft pitch, pills with a bright bold value and a muted normal-weight label, the hint and wiki link centred under the press, the counter at the card's far right and the today's-poll tag floating over the top-right corner. Kit fixes found on the way: the Button base's text-xs was emitted after text-sm/text-xl and won every tie (md/lg never rendered text-sm; sizes now live on the shapes, base carries none, app look preserved); Icon's base size-3.5 no longer opposes a caller's size.

- The development Email | GitHub switch sits fixed in the screen's bottom-right corner; the press slot shows the email panel or the GitHub press by the chosen method.

- Later the same day: the hint under the press and the today's-poll tag removed; the pitch moved into the viewmodel so the category count (12) is read from the code; a random screen theme per load, rolled in the route loaders of / and /login through loginLoader (exported from the login component because routes may import presentation only), threaded as a theme prop; the authed layout's login fallback keeps the cerulean default. Server-rendered theme confirmed to vary per fetch.
