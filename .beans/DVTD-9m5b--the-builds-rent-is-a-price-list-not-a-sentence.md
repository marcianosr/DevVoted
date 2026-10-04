---
# DVTD-9m5b
title: The build's rent is a price list, not a sentence
status: completed
type: task
priority: normal
created_at: 2026-09-27T12:07:45Z
updated_at: 2026-09-27T12:24:23Z
---

**What:** The shop drops its Next gate panel and its inline bill tail, and the build's upkeep tooltip lists every weight rung with the rent it bills.

**Why:** A player deciding what to install wants the whole price ladder at once, not one rung named in passing inside a paragraph.

## Done when

- [x] The shop no longer shows a Next gate panel
- [x] The upkeep tooltip keeps its first sentence and then lists each weight rung as a badge with its billed cost behind it
- [x] No surface reads 'before the bill becomes'
- [x] The shop offers a press to the community board, as gate prep already does

## Notes

Rungs come from the run rules; the kanto kit may not import them, so they arrive as props.

## Summary of Changes

The upkeep badge above the build opens on the whole rung ladder: the first sentence, then one badged weight per rung with its rent behind it, and the rung the build stands on marked. The ladder arrives as a prop because the kit may not import run rules.

Four readings went, each because the ladder or the track already said it: the Next gate panel (deleted along with its viewmodel, fixtures and the coverage plumbing only it used), the "before the bill becomes" tail on the room line, the weight summary in the new-run Build heading, and the gate name in the Audits lock. The new-run note now badges its figure. The shop gained a community press, and the four copies of the word Community now read one string in shared copy.

Removed as dead once their only caller went: NextGate.ui and its spec/stories, nextGateFor, BuildSpaceView.nextWeight/nextPerGateKb, NextRung, kantoNextGateAt, SHOP_UNITS_HELD, kantoBuildWeight. rungAfterBuild survives in the domain with its own spec but now has no caller.

Verified: tsc clean, lint and dependency-cruiser clean, wiki in sync, 4170/4171 tests pass. The one failure (Screen.spec, bg-theme-faint chroma floor) is pre-existing: src/styles/app.css was reformatted before this session, turning `max(c * var(...))` into `max(c* var(...))` and flipping -webkit-font-smoothing from antialiased to auto.

Docs: ADR-073 and wiki sections 2.x/6.x lost their NextGate and bill-tail citations; CHANGELOG has two Changed entries.
