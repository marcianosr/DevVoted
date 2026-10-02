# ADR-170: A swatch is earned by covering every change

## Status

Accepted 2026-10-02 (Marciano, DVTD-0mn8). Supersedes
[ADR-080](080-the-swatch-is-won-by-the-window.md) Decisions 1 and 2 and the
flawless-window ask in [ADR-136](136-the-stakes-column-leads-with-the-reward.md).
ADR-080 Decision 3 (the run keeps a list of stamped gates) stands.
Decisions 3 and 4 superseded 2026-10-02 by
[ADR-171](171-the-player-sees-coverage-never-the-codebase.md): the player sees
coverage, never the change count.

## Context

ADR-080 gave the swatch to a flawless window: five right answers. ADR-161 then
made accuracy multiply the window, and a gate ships between 9 and 11 changes
(ADR-139's codebase). Five right is no longer what a gate asks for. At Boulder
five singles at ×2 cover 10 of 9 changes, so the badge and a full bar land
together. From Volcano on the gate ships 11, five right cover 10, and the same
clean window that took the badge at Pallet leaves a change uncovered. The prize named
a count the scoring screen no longer uses.

Prep also never said how big the gate was. "Answer all 5 right" read the same at
every gate, while the codebase grows.

## Decision

1. **A full bar earns the gate's swatch.** The close stamps the gate when it
   covers every change the gate ships: held coverage at 100% or more, which is
   the PERFECT band (`coversEveryChange`). The head start carried from the last
   gate and coverage that configs add both count. The right-answer count does not.

2. **The flawless window keeps its floor.** Five right still clamp a close to
   SHAKY at worst (`isFlawlessGate`, `closingBandFor`). That rule is about
   survival, not the badge.

3. **At stake opens on the changes the gate ships.** Before the objectives, the
   panel states "Boulder ships 9 changes", what one right answer covers, and a
   box per change, filled as the bar covers it. The swatch objective reads
   "Cover all 9 changes".

4. **The debrief counts changes, not answers, for the swatch.** The Earned row
   reads "9 of 9" against "needs all 9 changes covered". The header keeps
   "5 of 5 right", which is still the window's count.

## Consequences

**The swatch and PERFECT are now one event.** ADR-080 kept them apart on
purpose. Joining them makes the badge a coverage prize: a build that adds
coverage helps earn it, and a carried surplus can earn it with a miss.

**Late swatches get harder.** At the 11-change gates (Volcano to the Champion), a
bare five right at ×2 no longer mints the badge without help from a config or
the head start.

**A skip no longer forfeits the swatch outright.** It covers nothing, but a
head start can still carry the bar to full.
