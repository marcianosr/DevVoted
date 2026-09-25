---
# DVTD-bh9d
title: kill -9 ends the run from the shop, earned by clearing gate 5
status: completed
type: feature
priority: normal
created_at: 2026-09-25T17:52:32Z
updated_at: 2026-09-25T18:06:09Z
parent: DVTD-r2k9
---

**What:** Abandoning a run is a registry service named kill -9: unlocked once per account by clearing gate 5, then in every shop, free, ending the run on a second press.

**Why:** The rebuilt game has no way to abandon a run, and the old free abandon press let a first run walk away before it had learned anything.

## Done when

- [x] kill -9 sits among the shop's services once earned, with no price
- [x] The first press arms the row and the second ends the run; a press elsewhere disarms it
- [x] Ending the run banks nothing and lands on the new-run screen
- [x] Until earned it reads "unlock · Clear gate 5" in the shop and the Dex

## Notes

- Marciano, 2026-09-25: "Would also be cool if an Abandon run is a service. Can we dev-theme that too, and unlock it after gate 5?" Read as clearing gate 5, which is standing at gate 6 (`reached-gate:6`); one constant, `ABANDON_FROM_GATE`, if standing at gate 5 was meant.
- Name: SIGKILL ends the process with no cleanup, which is what abandoning does (`storageCreditRate("abandoned")` is 0, nothing banks). `Ctrl+C` is the softer alternative.
- Recorded as ADR-115 D11. The `abandonRun` server function and `useRunActions().abandon` already existed; nothing on the kanto screens called them.

## Summary of Changes

- Roster row `abandon`: title `kill -9`, glyph ✕, registry scope, sold in the shop from the first shop, unlocked by `reached-gate:6` (`ABANDON_FROM_GATE`), caption `Clear gate 5`.
- Shop: `ShopView` takes `onAbandon`; the row carries no price; the first press arms it (`press again to end the run`), the second calls `onAbandon`; any other service press disarms it. `RunShop.component` wires `useRunActions().abandon`; the dev rig and the config harness pass an inert handler.
- Dex line `Registry · ends the run`, price `free`.
- Docs: ADR-115 D11, wiki §2.1 and §5.2 and glossary, CHANGELOG Added bullet. Specs: a `ShopView kill -9` describe (unlock line, two presses, disarm, no price) and the roster spec.
