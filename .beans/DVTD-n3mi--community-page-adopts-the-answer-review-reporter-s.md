---
# DVTD-n3mi
title: Community page adopts the answer-review reporter style
status: completed
type: feature
priority: normal
created_at: 2026-08-07T11:16:11Z
updated_at: 2026-08-07T12:36:27Z
parent: DVTD-h175
---

The community page reads as two widgets stacked on a page: `ClimbToday` in its own bordered
card with a title, and `RunCommunityBoard` under a "Community" heading. The poll rows also
spend their vertical budget on options nobody picked.

Borrow the vocabulary the gate review already ships (`AnswerResults.ui.tsx`, DVTD-dqbc):
native `<details>` question rows, a diff-shaped body showing only the options that took part,
and an `N other options ▸` tail for the rest. The climb map loses its card chrome and becomes
the screen's top matter; fallen runs compress from greyed avatars to `†` marks on the line.

No server work — `isRight`, `yours` and `count` are already in the `CommunityOptionResult` DTO.

## Todo

- [x] Extract `src/ui/Disclosure.ui.tsx` from `AnswerResults`' `OtherOptions`, + story
- [x] `ClimbToday.ui.tsx`: drop card chrome and header, daggers for fallen, conditional
      Uncharted hatch, one footer row, one-line legend, drop the `best` label
- [x] `RunCommunity.ui.tsx`: "Today's polls", native details rows, always-on tone-coded
      percent, drop category, `multi` sub-line, left rule, correct+yours split with a
      voted tail, standouts summary, section rules
- [x] `Screen.ui.tsx`: `footerNote` slot; `RunCommunity.component.tsx` countdown left +
      "Back to your run →" with a hint when locked
- [x] Update `RunCommunity.spec.tsx`, `ClimbToday.spec.tsx`, both stories
- [x] Update `docs/wiki.md` §7.2 and `CHANGELOG.md`
- [x] Verify: tests, lint, build (browser check skipped at Marciano{{APOS}}s call — see below)

## Summary of Changes

**Shared (Tier 1)**
- `src/ui/Disclosure.ui.tsx` (new, + story) — the `<details>` + faint summary +
  rotating `▸` shell, lifted out of `AnswerResults`' `OtherOptions`. Scoped as
  `group/disclosure` so it nests inside a caller's own `group` without the two
  carets rotating together. `AnswerResults.spec.tsx` passed unchanged (17/17),
  which is the proof the extraction was behaviour-neutral.
- `src/ui/Stack.ui.tsx` — `divided` prop (`divide-y` + a compound variant that
  matches top padding to the gap, so the rule sits centred in the gap rather
  than hanging off the next section's forehead).
- `src/ui/Screen.ui.tsx` — `footerNote` slot, rendered left of the actions and
  sharing the left seat with `leftAction` so a screen with both still lays out
  as two sides. No existing caller passes it.

**Climb map** (`ClimbToday.ui.tsx`)
- Card chrome and the "The climb today" / "N on the route · M fallen" header
  dropped — the map is the top of the screen, not a widget on it.
- Fallen: greyed avatar below the line → cinnabar `†` with a Tooltip naming the
  player. Lower lane `h-8` → `h-5`.
- Uncharted zone hatches (`repeating-linear-gradient` in `--theme-color`) only
  below 35% width; wider than that keeps the bare dashed edge, which is the case
  the fill was removed for in the first place. Label moved to the zone's
  top-right — the far end from the boundary, where "you"/"best" live.
- Footer collapsed to one row: progress copy left, `gates 8–12 →` right.
- Legend cut to two entries; the `best` label above the ghost dropped.

**Poll board** (`RunCommunity.ui.tsx`)
- "Community" → "Today's polls"; `{n} players answered`.
- Rows are native `<details>` (no `useState` toggle), one rotating caret.
- The share correct is always in view, copy `{n}% correct`, toned celadon ≥60 /
  saffron ≥40 / vermillion below — the trio `StatusBadge` outline already uses.
- Category label dropped (ADR-020); `multi` moved to a sub-line.
- Options split `isRight || yours` open, rest folded behind
  `N other options, M votes` in the shared `Disclosure`; tail rows keep their
  chips and counts. Open body gets a `border-l` gutter.
- Standouts: name dropped (avatar tooltip carries it, as on an option row), and
  your haul summarised beside the heading. `topPercent` footer kept.

**Wiring** — `Back to your run →` (was `Climb on →`), still disabled when the run
is locked, now with a `hint` popover saying why; the countdown moved out of the
button label into the permanent footer note.

**Verification** — 1233 tests / 117 files pass, `tsc --noEmit` clean, oxlint +
dependency-cruiser clean (579 modules), `npm run build` clean.

## Not verified in a browser

The chrome-devtools MCP profile was held by an orphaned Chrome
(PID 58986, `--remote-debugging-pipe`, so unattachable) and no Claude Chrome
extension is installed. Marciano chose to skip rather than kill the process.

Two things only an eyeball settles, both worth a look before this is called done:
- the 35% hatch threshold — compare `Run/ClimbToday` stories `MidClimb` (wide,
  bare) against `NearingTheSummit` (narrow, hatched);
- the `Stack divided` rhythm and the poll rows' left gutter — see
  `Run/RunCommunityBoard` → `MissedIt`, which reproduces the mockup.

## Shipped in a711c1d ("feat: alot of improvements")

Marciano committed this alongside a further rework of the climb map, so parts of
the ClimbToday half of this bean were superseded on the way in. What actually
landed:

**Survived as written** — the whole poll-board half (`Disclosure`, `crowdTone`,
`tookPart`/`tailSummary`, `standoutSummary`, native `<details>` rows, the left
gutter), `Stack`'s `divided`, `Screen`'s `footerNote`, and the conditional
uncharted hatch (`UNCHARTED_HATCH_MAX_PERCENT = 35`).

**Superseded** — the climb map went further than this bean planned: the gate
ladder moved onto the track itself (each swatch sits where its gate starts,
numbered and named), all 13 gates now fit on desktop, and the windowed/paged
model was dropped, taking `gateWindowRange`/`shiftWindowStart`/`gateRangeLabel`/
`progressLine`/`bestGapLine` out of `climbMap.model.ts` with it. Fallen runs went
back to dimmed avatars rather than the `†` proposed here — though they kept the
`Tooltip` this bean gave them in place of the native `title`.

Post-commit state: `tsc --noEmit` clean, oxlint + dependency-cruiser clean
(580 modules), 1214 tests / 117 files pass.

The browser check noted above was never run and still hasn't been.
