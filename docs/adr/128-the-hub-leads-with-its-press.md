# ADR-128: The hub leads with its press

## Status

Accepted — 2026-09-27 (Marciano, DVTD-a6vs). Extends
[ADR-117](117-the-primary-press-is-one-wide-bar.md) decision 1 with a third
place the wide bar is drawn.

## Context

ADR-117 settled what the one press on a screen looks like: a wide bar with a
mark, a bold label, a quieter reading, and an arrow. It named two renderers —
`ScreenFooter.action` and the poll's `commit` — and both sit at the bottom,
because on every screen it described the press is what you do *after* reading
the screen.

`/run` is not that kind of screen. Nobody arrives at the hub to study it. They
arrive to get back into the run, and everything else there — the ladder, the
standing, coverage, what the room did — is reference they may or may not want.
Putting the one thing they came for last, under two rows that each offered a
second way to reach it, made the hub a menu.

## Decision

1. **The hub draws the press first.** `TodayScreen` renders `Action` at the top
   of the screen rather than in a `ScreenFooter`. It is still one press, still
   the ADR-117 bar, still wearing the gate as its mark; only its place on the
   page changes. Screens that conclude with a press keep it in the footer.

2. **The press states the run's position and the clock.** The label names the
   gate it resumes onto, the mark counts the polls left today, and the note
   carries the poll's place in the gate beside the time the next polls open.
   The day being spent is not a separate surface: the press takes the clock as
   its label and shuts.

3. **What is under the press is standing, not a choice.** The ladder and the
   run's standing sit in the same plate as the press. Coverage and the community
   are cards below it. The community card is the only one that leads anywhere,
   because it is the only one with a screen behind it — the coverage card is a
   readout, since `syncTarget` bounces a player off `/run/review` from the hub.

4. **The shop stands beside the press, refused rather than absent.** The shop is
   reachable only while a gate is paying out. An aside that appears and vanishes
   teaches nothing, so it is always drawn. What would open it is carried in the
   press's accessible name and nowhere on screen: `Button`'s `detail` prints on
   hover, and a reason that appears under the cursor is a reason most players
   never read and every player's pointer trips over. This is ADR-117 decision
   6's aside, at the press's own height.

5. **A rung's percentage wears its band's colour, not ambient grey.** `Figures`
   badges `OK` and `HEALTHY` from its band list but leaves `40%` and `60%`
   uncoloured, because a regex over one string cannot know which rung a number
   belongs to. The hub composes the pair itself instead, so the word and the
   number it is paid at read as one mark. `rungsFor` returns the band beside
   its figure rather than a joined sentence, which is what makes that possible.

## Consequences

`TodayScreen` no longer renders `ScreenFooter`, so the hub is the one screen
where a refusal has no press to live in. It stands on its own line in the plate.

`todayScreen.viewmodel.ts` grew from one export to seven. The press's label,
note and count, the standing line, the coverage rungs, the room's line and the
shop's state are all picked by run state, which under
[ADR-102](102-copy-has-one-owner.md) makes them the viewmodel's, not the
container's. `RunStart.component.tsx` builds no copy at all now.

`CoverageRing.note` widened from `string` to `ReactNode`, because decision 5's
rungs are a composed pair of badges rather than a sentence.

The ring needs `ceiling={100}` at every call site that reads a percentage of the
whole. Its default ceiling is `max(demand, held)`, which fills the dial the
moment coverage meets the rung — right for a gate meter, wrong for "how far
along am I".

The press's mark counts the gate's remaining polls, not `pollsLeftToday`. That
field is `polls.length - currentIndex` over the run's whole pool, so on a seeded
database it reads `96`. The mark is now `pollsPerGate - answeredThisGate.length`,
derived from what `pollLabelFor` already counts, so the mark and the label can
never disagree.

[ADR-130](130-the-bar-carries-what-every-screen-needs.md) decision 1 splits
decision 2's clock by screen: the press states it on the hub, the top bar states
it everywhere else. The press is still the only surface that shuts on it.

The hub's rows are gone. "Today's polls" duplicated the press, and "Community"
became the card. `TodayScreen`'s `run`, `action`, `polls` and `error` props went
with them.
