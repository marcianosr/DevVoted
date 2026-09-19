---
# DVTD-agt2
title: 'Kanto community screen: the bones'
status: completed
type: feature
priority: normal
created_at: 2026-09-11T11:05:09Z
updated_at: 2026-09-11T11:15:20Z
---

A kanto-theme `CommunityScreen` as the day's home screen: what you land on before the new polls drop, and after you have answered all five.

The live `/run/community` (terminal-theme, ADR-065) stays untouched. This is the kit screen plus its fixture, story and spec.

## Sections

- Header: hero swatch, seed line, countdown badge, icon stats, shop + prep buttons
- Your climb: the gate just cleared, coverage against the demand, shop-window note
- Who showed up: answered all / partway / not started, with climber stacks
- Where everyone is: placeholder div, the climb map comes later
- Standing out: four cards (most active, most knowledgeable, fastest, biggest bank)
- The five polls: sealed before you answer, distribution + voters after
- Conversation: rows of climber, time, message, outcome badge

## Decisions

- Standouts take the four-award roster, reversing ADR-065 (new ADR-067)
- Climber chips render the existing border art from the catalog, flush rather than scaled
- Chips get a keycap extrusion (`border-b-4`), the `Choice` idiom, for the "height"
- One screen for both states; unanswered polls seal category AND share
- Screen theme follows the cleared gate via `Screen gate={swatch.theme}`

## Todo

- [x] `Climber.ui.tsx` + stories + spec (chip and stack)
- [x] Extend `Icon.ui.tsx` with clock, closed, storage, votes
- [x] `PollResult.ui.tsx` + stories + spec (sealed and revealed)
- [x] `kantoCommunity.factory.ts` with three variants
- [x] `CommunityScreen.ui.tsx` + stories + spec
- [x] ADR-067 reversing ADR-065, plus README index line
- [x] Follow-up beans
- [x] lint, build, tests

## Summary of Changes

Seven new files, one extended, three docs touched. The live `/run/community` is untouched.

### New

- `src/ui/kanto-theme/Climber.ui.tsx` (+ stories, spec): the climber chip and the overlapping stack. Renders equipped border art flush at `inset-0` rather than `scale-120` (which is why the terminal chips bled at the corners), and stands the face on `border-b-4` for the keycap height, the idiom `Choice` already uses.
- `src/ui/kanto-theme/PollResult.ui.tsx` (+ stories, spec): one poll, sealed or revealed. Sealed withholds category and share entirely, no `???`, because an unanswered poll can be dealt again in a later seed. Revealed draws per-option bars, voter stacks and counts; the voter and vote columns are icons, not a "Who picked it / votes" header.
- `src/ui/kanto-theme/CommunityScreen.ui.tsx` (+ stories, spec): seven sections, header, your climb, who showed up, where everyone is (placeholder), standing out, the five polls, conversation. Themes off the cleared gate via `Screen gate={header.swatch.theme}`.
- `src/test/kantoCommunity.factory.ts`: `kantoCommunity()`, `kantoCommunityBeforePolls()`, `kantoCommunityFirstClimb()`.
- `docs/adr/067-standouts-are-four-plain-standings.md`.

### Changed

- `src/ui/kanto-theme/Icon.ui.tsx`: four glyphs added, `clock`, `closed`, `storage`, `votes`. No icon library is installed; the set is hand-drawn 14x14 stroke paths.
- `docs/adr/README.md`: 067 row, and 065 marked reversed.
- `docs/adr/065-standouts-are-six-climb-shaped-awards.md`: status note pointing at 067.
- `docs/wiki.md` section 7.3: forward pointer; the six are still what the code computes.

### Corrections to the mock

- "Prep for Vermilion" became "Prep for Rainbow". Gates carry badge names, and gate 5 after Lavender is Rainbow.
- "Your branch" became "Your climb". Climb is the established player-facing word for a run; branch was a new coinage.
- The "N% of climbers, ever" line under each standout is gone.

### Known gap

ADR-067 is accepted but `standouts.model.ts` still computes ADR-065's six. Stated in the ADR, the README row and the wiki. `DVTD-j6t1` closes it.

### Verification

- `npm run lint`: clean; depcruise 986 modules, no violations
- `npm run build`: exit 0
- `npm test`: 244 files, 4337 passed, 6 skipped, 2 todo

No changelog entry: the screen is kit-only and not wired to a route, so nothing is player-visible yet.
