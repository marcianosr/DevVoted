---
# DVTD-l0dm
title: 'Playtest pass: gate debrief header, objectives, incidents placement, tooltip on touch'
status: completed
type: task
priority: high
created_at: 2026-09-23T17:47:08Z
updated_at: 2026-09-23T18:13:52Z
---

Live playtest feedback on the kanto run screens (2026-09-23).

## Todos

- [x] "attack earned" chip reads "audit earned" (panel title and empty states too)
- [x] Gate outcome subtitle: drop "the bar filled / next up X", state the swatch outcome instead
- [x] Prep header: drop "today's 5 polls are ready"
- [x] Main objective: lead reads "Main objective", statement on top, "to clear the gate" under it, drop the explain sentence
- [x] Extra objective: no "+" mark, no indent, styled like the main objective
- [x] Incidents move onto the community page
- [x] Band words (HEALTHY, OK, ...) always render in a badge, never bare prose
- [x] Tooltip opens on touch — the hover-only popover is dead on mobile

- [x] Poll: drop the separate submit footer, put the lock-in press in the poll panel footer

## Summary of Changes

Nine playtest notes, all shipped. 186 test files / 3586 tests pass; typecheck clean; lint clean (4 pre-existing warnings); dependency-cruiser and docs:check green.

**Copy**
- `ATTACK_EARNED` chip -> "audit earned"; `ATTACK_TITLE` -> "Your audit"; `ATTACK_UNARMED` -> "no audit armed". Domain keeps `Attack` (ADR-099 distinguishes the armed shot from the payload).
- Gate debrief subtitle: "the bar filled / next up X" replaced by the swatch verdict on the PERFECT and HEALTHY bands. OK/SHAKY/DANGER keep their own tails.
- Prep header drops "today's 5 polls are ready"; the part-way "N of 5 polls answered" stays.

**Objectives (`Objectives.ui.tsx` + `bandOutcomes.viewmodel.ts`)**
- One `Objective` shape for required and extras. Lead "Main objective", statement first, "to clear the gate" under it.
- `clearExplainFor`/`owedClause`/`shutClause` deleted with the coverage sentence; `BandOutcomesFrame.openingHeld` went dead with them and was removed up through `PrepFrame`.
- "+" glyph gone. Two extras: the swatch (PERFECT) and the audit (HEALTHY), the latter dropped where the clearing rung is already healthy.

**Bands as badges**
- `Figures` regex extended with the five uppercase band words, coloured from `COVERAGE_BAND_COLOR`. `AttackPanel` routes `empty`/`note` through it.

**Incidents onto the board**
- `IncidentsScreen`, `RunIncidents` and `/run/incidents` deleted; new `IncidentsPanel.ui.tsx` composed by `CommunityScreen`. `CommunityHeader.shop` now optional. routeTree regenerated, `KNOWN_ROUTE_IDS` trimmed.

**Tooltip on touch**
- `useState` + explicit `focus()` on press, `onBlur` to close. Safari does not focus buttons on click, so `:focus-visible` could never have worked.

**Poll commit**
- Live submit footer replaced by `PollScreen.commit`, drawn in the poll panel footer. `pollCommitFor` owns label and note from one count.

Docs: CHANGELOG (Changed x6, Removed x2), CONTEXT.md incident row, wiki 7.4, ADR-099 §7.
