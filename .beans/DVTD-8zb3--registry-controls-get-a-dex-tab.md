---
# DVTD-8zb3
title: Registry controls get a Dex tab
status: completed
type: feature
priority: normal
created_at: 2026-09-24T14:13:14Z
updated_at: 2026-09-25T11:50:03Z
parent: DVTD-z2r2
---

**What:** The Dex gains a controls tab listing the three registry controls the shop sells, each redacted until the account has first met it.

**Why:** Two of them only appear deep in a climb, so a player who never gets there never learns they exist, and nothing outside the shop names them.

## Done when

- [x] The Dex opens on six tabs and the new one lists every registry control
- [x] A control the account has never reached reads as redacted and names only the gate that opens it
- [x] A met control states what it does, how long its purchase lasts, and what it costs
- [x] Reaching a control's gate in the climb you are in the middle of is enough to meet it
- [x] Nothing about buying, pricing or staging a control changes inside a run

## Notes

Reveal, never Grant: DVTD-2try decided on 2026-08-26 that shop controls stay
account-ungated because the player who keeps dying at gate 3 is exactly the
player who needs Extend. ADR-029 records the same stance from the other side —
steering the offers is bought with the run's own storage, not with account
progression. This bean builds the follow-up that bean listed and never shipped.

Two deviations from DVTD-2try's wording, decided with Marciano 2026-09-24:

- The tab is **controls**, not "tools". The shelf was renamed Registry on
  2026-09-10 and the code has called these rows `RegistryControl` since.
- **Offer Lock is out of scope.** ADR-054 moved locking onto the yarn.lock
  config, so the config unlock system already reveals it; a row here would give
  one thing two unlock paths.

Storage plans were to ride the same tab. Still outstanding, and still blocked:
no plan ladder exists in the code to reveal.

"Met" is read from `run_states.gates_cleared`, which the Dex already fetches for
its Runs tab, taken before the ended-runs filter so the live climb counts. It
cannot be read from `owned_swatch_ids`: ADR-080 made the swatch a prize for a
flawless window, not for the clear.

## Summary of Changes

The Dex gained a **controls** tab (seafoam), third in the strip, listing Rebuild,
Extend and the git tag. A met row carries the control's glyph, name, what it
does with its horizon appended ("deals a fresh set of offers · lasts the
visit"), and its price shape ("from 4 KB, doubling"). An unmet row is the same
row withheld — `?` cap, `???` name and sentence, no price — with the gates that
sell it still showing in the trailing slot, which is the requirement.

One roster now owns the three controls (`registryControl.model.ts` in the shop
domain): glyph, title, detail and the gates-cleared floor each answers to,
importing `EXTEND_FROM_GATE`, `PIN_FROM_GATE` and `PIN_UNTIL_GATE` rather than
restating them. The shop screen reads its row copy from it, and the gate ladder's
duplicate `ACTION_UNLOCKS` table was deleted in favour of it — `GateAction` is
now the roster's own id union, so the ladder gained "rebuild" at gate 0.

Depth reaches the Dex through the query it already ran: `deepestGateIn` was
widened to read rows or entries, and `GateRunsData` gained `deepestGate` taken
before the ended-runs filter, so a control met in the climb under way counts at
once. No migration, no new query, no new table.

`RegistryControl.ui.tsx` became `Redactable`, following the same locked branch
`Audit.ui.tsx` uses, so the Dex row is literally the shop row. Its unredacted
half is exported as `MetRegistryControlProps` for callers that always hold a
control.

Verified: 3684 tests pass, `tsc --noEmit` clean, oxlint clean (4 pre-existing
warnings, none in this change), dependency-cruiser clean over 710 modules, wiki
in sync. Docs updated: wiki §6.4 and the glossary, CONTEXT.md's Dex and
shop-domain rows, and a CHANGELOG entry (minor bump).

Deferred: storage-plan rows on this tab, still blocked on there being no plan
ladder in the code to reveal.

2026-09-25: the tab was renamed **services** and split into registry services and run services by DVTD-jscc (ADR-115). Code names are unchanged.

2026-09-25 (ADR-116, DVTD-k59a): Reveal-not-Grant is reversed for services. The tab now reads the account's service grants, not the deepest gate; `GateRunsData.deepestGate` is gone; a locked row states how to earn it.
