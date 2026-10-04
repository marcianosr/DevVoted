---
# DVTD-zr20
title: The poll screen never says where the multiplier came from
status: completed
type: feature
priority: high
created_at: 2026-09-15T09:45:32Z
updated_at: 2026-09-15T10:22:09Z
---

On the kanto poll screen a correct JavaScript answer pays 1.3 and the screen never says why. The player sees the figure land in the "what each poll paid" badges with no route back to the .js config that caused it.

The screen promises the explanation and withholds it: ScoringRule.ui.tsx teaches the 0/1/2 ladder and closes with "before the build multiplies it". It names a multiplier it never shows.

## Decisions

- The explanation lands AFTER answering, not as a pre-answer prediction.
- Each build chip additionally states its own contribution for this poll.
- The flash fires on answer submit, on the config(s) that actually paid, and must read folded or open.
- Breakdown rows read in their native form: multipliers as x1.25, flat adders as +0.1 units.

## The 1.3 is a rounding artefact

CONFIGS.js has no level, so focusMultiplierOf resolves to 1.25. The 1.3 on screen is paidOf putting roundToOneDecimal on a units figure, against the convention stated at rules.model.ts:141 ("Units carry a second decimal: a 1.25x focus on a 1.25x cache is 1.56, not 1.6"). Payout figures move to two decimals so the breakdown reconciles.

## Todo

- [x] CoverageConfigBonus gains factor?: number
- [x] coverageBreakdownForAnswer attaches cover.mult as factor
- [x] ConfigStatus online arm carries the Coverage
- [x] pollNoteFor: ConfigStatus to chip badge/detail, a case per SkipReason kind
- [x] pollBuildFor merges the note and marks credited chips
- [x] pollBreakdownFor returns LedgerRows
- [x] Payout figures move to two decimals
- [x] PollScreen PollCoverage.breakdown renders as a third Panel.Body
- [x] ConfigChip credited -> data-credited
- [x] BuildFooter flash token, ADR-077 one-shot, data-flash on the footer
- [x] app.css flash rules + single-rule reduced-motion guard
- [x] PollView passes breakdown and flash token
- [x] Stories for the breakdown and the credited/flash chip
- [x] ADR-084
- [x] wiki + CHANGELOG
- [x] Poll screen shows only the gate in hand; run history moved to the gate debrief
- [x] Coverage lead badges the percentage beside the units
- [x] Removed the gate N / M counter and PollScores' "today" label
- [x] Fixed: ESLint's crossed-out answer never reached the kanto poll screen

## Summary of Changes

**Domain.** `CoverageConfigBonus` gained `factor?`, set from `cover.mult` in `coverageBreakdownForAnswer`. `ConfigStatus`'s online arm carries the `Coverage` it already computed (`changesCoverage` became `coverageOnPoll`), so the chip figure and the online/skipped routing are one source — a second derivation would need `cachedHits`, which is deliberately not on RunView.

**Presenters.** New `pollNoteFor` maps a ConfigStatus to a chip badge (`x1.25 here`, cinnabar under 1) or muted detail, with words for all 11 SkipReason kinds. `pollBuildFor` merges the note and marks `credited` chips from the answer's breakdown. New `pollBreakdownFor` returns LedgerRows. `runPaidFor` keeps the all-gates table for the debrief; `pollPaidFor` narrowed to the gate in hand.

**Rounding.** `paidOf` and the row total moved to `roundToTwoDecimals`. The 1.3 was `roundToOneDecimal` on a units figure, against the convention at rules.model.ts:141.

**UI.** `PollCoverage.breakdown` renders as a third Panel.Body via LedgerRows + PanelTable. `ConfigChip` gained `credited` -> `data-credited` (an attribute, not a class, so the geometry-diff spec still passes). `BuildFooter` holds the flash one-shot (ADR-077 shape, 1200ms) and sets `data-flash`; app.css lights the credited chips when open and the shut panel when folded.

**Also asked for mid-task:** coverage percentage badged in the lead sentence; poll screen narrowed to one gate with the history moved into the gate debrief's Coverage fold; `gate N / M` counter deleted (HeaderProps.gateCount gone); PollScores lost "today" and widened its score column with a wrapping badge track.

**Bug found while playtesting:** ESLint's cross-out never reached the kanto screen. `RunView.disabledOptionIds` was consumed only by the old-theme AnsweringScreen; kanto `Choice` supported `crossedOut` but `QuestionOption` had no such field. Wired through. The fee escalation (per gate window) and the "at least two options remain" guard (`wrongStillOn > 1`) were already correct and untouched.

ADR-084. Wiki 2.5 and 8 updated. CHANGELOG has six player-facing entries.

Verification: 245 of 246 spec files pass; the one failure is `gate.model.spec.ts`'s two floor-rule tests, which fail identically with these changes stashed. `npm run build` clean, `npm run lint` clean (981 modules, no dependency violations).
