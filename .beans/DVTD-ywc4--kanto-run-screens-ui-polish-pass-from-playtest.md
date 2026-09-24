---
# DVTD-ywc4
title: 'Kanto run screens: UI polish pass from playtest'
status: completed
type: task
priority: normal
created_at: 2026-09-23T12:24:46Z
updated_at: 2026-09-23T12:38:51Z
parent: DVTD-cb52
---

Eleven rough edges found in a live playtest of the kanto run screens. Ten are presentation defects; one is a real number bug.

The bug: the "By category" footer read `+46% of 60% needed` while the coverage bar two panels up read `100%`. `+46%` is this gate's own gain (units over every slot the run has opened); `60% needed` is the cumulative HEALTHY line. Two different quantities side by side in a row that reads as a comparison.

Decisions:
1. The `this gate` total row is deleted, not relabelled — both figures already have owners (the bar draws the HEALTHY mark and the pin; the panel header badge states the gain). ADR-102.
2. `5 of 5 answered` becomes `5 of 5 polls answered` — the note sits beside the swatch track, whose squares are gates.
3. Build header keeps `Build` + the amber badge; the prose moves to the top of the panel body as a badged Lead line; the caption under the weight bar is deleted as the duplicate.

## Todo

- [x] 1. PollScores: chips on one line, total wears a badge
- [x] 2. app.css: lighter, less saturated `text-theme-muted` for every theme
- [x] 3. gateOutcome.viewmodel: delete the `this gate` total row; keep the gain badge on the failed path
- [x] 4. `gate cleared` -> `Gate cleared`; its detail becomes stacked notes
- [x] 5. LedgerRows: add `notes`; stop the badge cluster crushing the label
- [x] 6. NextGate: badge the band word
- [x] 7. Drop "The run already holds this line."
- [x] 8. Build panel: header = title + badge, prose moves to the body as a Lead line
- [x] 9. Delete the duplicated weight caption under the bar
- [x] 10. prepScreen: `5 of 5 polls answered`
- [x] 11. PollScreen coverage header: badge the reading
- [x] Specs and stories updated
- [x] lint, test, build green
- [x] CHANGELOG entries (none needed - see summary)

## Summary of Changes

All eleven items done. 3554 tests pass, lint and build clean.

**The bug (item 3).** `+46%` was the gate's own gain, `60% needed` the run's cumulative
HEALTHY line. Both figures were right; pairing them was not. Deleted the `this gate`
total row from `coverageRows` — the bar above already draws the HEALTHY mark and the
pin, and the panel header badge already states the gain. The gain badge now also shows
on a failed gate, beside the shortfall, so nothing was lost there.

**Kit changes.** `LedgerRow` gained `notes` (stacked, `·`-marked, `text-xs`) and stopped
letting a `shrink-0` badge cluster crush its label. `PollScores` keeps its chip track on
one line by freeing the two fixed columns rather than by adding an overflow container,
which would clip the chips' tooltip receipts; the row wraps as a whole if it still
cannot fit. `CoverageBar` gained `CoverageReading` and lost `coverageReadingOf`, which
had no callers left. `WeightTrack` gained `roomPartsOf`, and `roomLineOf` is now its
flattened text, so the badged and the plain form of that sentence cannot drift.

**Build panel.** Header is the title plus the amber bill; the prose moved below it as a
badged `Lead` line; the caption under the weight bar is gone. The sentence is now stated
once.

## CHANGELOG

No entries. Every screen this touches — the gate debrief, the shop, the prep header, the
kanto kit itself — is under `[Unreleased]`. Per `docs/changelog-maintenance.md`, work
that has never shipped gets no `Changed` entry, and a bug introduced in unreleased work
gets no `Fixed` entry.

## Deferred

Nothing from this list. Pre-existing and untouched: `@sentry/react` unlisted in
package.json and `nitro` sitting in dependencies rather than devDependencies, both
flagged by `lint:dead`.
