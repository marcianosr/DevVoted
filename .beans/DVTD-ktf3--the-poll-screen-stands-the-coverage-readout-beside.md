---
# DVTD-ktf3
title: The poll screen stands the coverage readout beside the question
status: completed
type: task
priority: normal
created_at: 2026-09-25T09:11:41Z
updated_at: 2026-09-25T15:17:50Z
---

**What:** On a wide screen the coverage readout moves out of the stack and into a rail beside the poll; on a phone the poll comes first and coverage follows it.

**Why:** Stacked, the readout pushed the question below the fold on every width, and a player reading the question could not see what it was being weighed against without scrolling back.

## Done when

- [x] A wide screen shows the poll and the coverage readout side by side, poll on the left
- [x] A narrow screen stacks them with the poll first and coverage under it
- [x] The readout follows the question down the page while the poll column scrolls
- [x] The category leader's handle reads the same as the poll author's, and links to their GitHub account
- [x] The dev rig's fabricated leaders carry a login, so the linked state is reachable there

## Notes

The pinned-on-a-phone readout is lost by the reordering: coverage now sits under the question on a phone, so there is nothing above the answers to pin. Flagged to Marciano.

## Summary of Changes

The poll screen body is now header, audit strip, one row holding the poll and the coverage panel, then the build bar. The poll leads in source order, so a phone stacks it first and the readout under it; from the large breakpoint the readout takes a fixed rail on the right and follows the question down the page. The screen claims the wide cap, without which two columns left the question around 460px.

The category leader now draws its handle exactly as the poll byline draws the author, link and all. The dev rig had no login on its fabricated leaders, so only the unlinked half of that row was reachable there; it now uses the trainer id, which is already login shaped.

Written up as ADR-113, which amends 068 and 070 on placement only. The wiki line saying the poll screen has no sidebar, and 068s one-column context line, were corrected in the same pass. 3745 tests pass, lint and typecheck clean.

## Follow-up, same session

Marciano then asked for the Lock in press to become the poll panel's first footer row, above the byline, keeping its pin. Only one element can own the bottom of the viewport, so this was put to him as a choice: he took the build sheet giving up its pin.

The send is now a sticky region of the poll panel between the question and the credit, carrying the panel's ground. The answered poll's press rides the same slot, as it did before. The build sheet keeps its place at the foot of the screen and its flash, but is no longer pinned. Written up as ADR-114, which amends 069 decision 1; the wiki and the two stale comments in the screen-footer kit were corrected with it. 3740 tests pass.

## Second follow-up, same session

The unpinned build sheet read wrong on the screen. Marciano wants both bars pinned as a stack: the sheet on the viewport floor, the send directly on top of it, each settling as its own place in the page scrolls into view.

The sheet's height is not a constant — its fold opens, its badges wrap — so the send is seated off a measured height. `Fold` is an uncontrolled `<details>` and nothing listens for `toggle`, so a player opening the build produces no React render; an observer on the box is the only thing that sees it. The sheet stays in the flow until it has been measured, with the send on the bare floor, because the server always renders the fold open and a phone collapses it at hydration — no single constant describes both, and guessing low would park an unmeasured bar over the press.

ADR-114 was rewritten in place rather than superseded, and its amendment note on 069 reverted. New: the first hook file under `src/ui/`, the first `ref` prop on a component in this repo, a no-op ResizeObserver in the test setup and a controllable one as a harness. 3780 tests pass.
