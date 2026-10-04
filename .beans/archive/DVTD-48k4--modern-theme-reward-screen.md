---
# DVTD-48k4
title: 'Modern theme: reward screen'
status: completed
type: feature
priority: normal
created_at: 2026-08-22T20:59:47Z
updated_at: 2026-08-23T13:14:23Z
---

Reskin the gate-clear reward screen in src/ui/modern-theme/ (Storybook only, Modern/Screens/Reward). Hero: award swatch + glow, name, collection track, three figure chips. Report panel: coverage + storage ledgers, poll outcomes strip, Enter shop / Review answers footer.

- [x] app.css: glow-theme utility (SHARED CONFIG)
- [x] Chip: raised tone + size axis
- [x] Action: size axis
- [x] Swatch: award size
- [x] SwatchTrack: layout + counting
- [x] Ledger.ui.tsx + ledgerTotal
- [x] Outcomes.ui.tsx
- [x] screens/RewardScreen.ui.tsx
- [x] specs + stories for each
- [x] verify: tsc, lint, tests, stories typecheck, css grep

## Summary of Changes

Storybook only, `Modern/Screens/Reward`. Nothing wired to a route.

**Shared config:** `src/styles/app.css` gains one `@utility glow-theme` (two-layer
box-shadow in `--theme-color`), beside `bg-theme-faint`.

**Extended:** `Chip` (`raised` tone + `sm`/`lg` size, on the tone branch of its union
only — rarity chips can't ask for either); `Action` (same `sm`/`lg` words, `lg` is
`px-6 py-3`); `Swatch` (`award` size, `size-24 rounded-3xl glow-theme` — the glow lives
in the size, not a prop); `SwatchTrack` (`layout="stacked"`, `counting="swatches"` →
"1 of 13 collected"). Every default preserves today's rendering, so poll and shop are
untouched.

**New:** `Ledger.ui.tsx` (+ `ledgerTotal` / `ledgerTotalLabel`), `Outcomes.ui.tsx`,
`screens/RewardScreen.ui.tsx`.

**The hero's three figures are derived, not passed.** `4.2%` is `ledgerTotal(coverage)`,
`+90 KB` is `ledgerTotalLabel(storage, "KB")`, `4 of 5 correct` counts the outcomes
array. Three fewer props and the summary cannot contradict the ledger below it — the
screen spec asserts `+90 KB` appears exactly twice for that reason.

**Deviations from the mock, deliberate:**
- "net" → "total" (asked for).
- Units on the total row only, both columns: `+4.2%` and `+90 KB`. Entry rows stay bare,
  matching how the storage column was already drawn.
- The coverage figure is viridian when the demand is met, cinnabar when short — not
  `text-theme`. A theme-coloured figure is cinnabar red on a Volcano clear.
- The coverage total is signed (`+4.2%`) where the mock drew it bare, so one rule covers
  both columns.
- No caps anywhere; headers are `coverage` / `storage`.
- The `⋯` overflow on the storage header is left out — same no-menu stub stripped from
  `ShopHeader` earlier today.

## Known gaps

- **Champion has no theme colour.** `swatch.model.ts` gives gate 12 `finish: "fill"` and
  app.css deliberately sets no `[data-swatch-theme="champion"]` rule, so a champion
  square inherits whatever `--theme-color` is above it. Modern-theme's `Swatch` has no
  `finish` axis at all — already wrong in the poll screen's track. No Champion story, so
  nothing misleading ships.
- `Enter shop →` carries the arrow inside its label, so the accessible name contains it.
  `Action` has no trailing slot; adding one for a decoration was not worth the axis.

## Verification

tsc 0 · oxlint clean · dependency-cruiser clean (709 modules, 2668 dependencies) ·
192/192 modern-theme tests (was 165) · 1937 passing repo-wide · stories typecheck clean
for `src/ui/modern-theme` (26 pre-existing errors elsewhere, which is why the exclusion
exists) · build confirms `glow-theme`, `size-24`, `rounded-3xl`, `tabular-nums`,
`bg-surface-raised`, `divide-edge`, `sm:divide-x`, `sm:divide-y-0` all emit.

**Storybook needs a restart** for the new classes.

## Follow-up — report panel matches the shop

The report was a floating card (`mx-5 mb-6 rounded-xl border`). It is now edge to edge
like `ShopScreen`: `REPORT` is just `border-t border-edge`, and the two ledgers stack
until `lg` — the shop's own breakpoint — rather than `sm`. No outer padding.

## Follow-up — celadon, KB on rows, foldable attribution

- **viridian → celadon across the whole folder** (24 files). `ModernTone` and `ChipTone`
  drop `viridian` and gain `celadon`; the token is renamed, not repointed. Changes the
  shop's install button and ×N badges too — one green for the theme. Note celadon is
  also `rarity.common`, so a common config's dot and a gain now share a hue.
- **KB rides every row of the storage column** (`+26 KB`), while `%` still rides only the
  coverage total. KB is currency: a bare `+26` in a money column is 26 of what.
- **`Ledger` folds its attribution.** `<details>` around the rows, summary carries the
  header plus a Caret and 'show / hide where it came from'. The total sits outside the
  `<details>` so it never disappears. `defaultOpen` (true) matches `Fold`/`Control`.
- **Fixed: `Control`'s caret never rotated.** It carried `group/entry` while `Caret`
  watches `group-open/fold`. Now `group/entry group/fold` — the PriceTag two-tap and the
  caret both work.

## Follow-up — one disclosure, hidden by default

Two per-column folds became one control. `Ledger` no longer owns a `<details>`; it takes
`showDetail: boolean` and renders its rows only when true. `RewardScreen` takes
`detailShown` + `onToggleDetail` and renders a single right-aligned button above both
columns; the story owns the `useState`, defaulting to false, the same way
`ShopScreen.stories` owns its held-offer state. Totals never hide and always sum every
entry, shown or not.

`Caret` now also rotates on `group-aria-expanded/fold`, so it serves a native
`<details>` and a controlled button identically.

## Follow-up — Space Mono toggle (Storybook only)

Self-hosted via `@fontsource/space-mono` (400 + 700), the same mechanism JetBrains Mono
already uses — no Google Fonts request. `app.css` gains `[data-font="space-mono"]` and
`[data-font="jetbrains-mono"]`; an attribute, not a class, so a wrapper beats the
`body { font-family }` rule by specificity.

**Config changes, flagged:** `.storybook/preview.ts` → `preview.tsx` (the decorator needs
JSX), a `font` toolbar global defaulting to `jetbrains-mono`, and a new dependency.

**Cost while it is up:** the build now emits 12 Space Mono woff2 files and 6 @font-face
blocks that nothing in the app opts into. Faces are only fetched when the family is used,
so runtime cost is nil, but the package and the two CSS rules must come out if Space Mono
loses.

## Follow-up — ledger rows redrawn (mock #73)

- Each row leads with a mark in a fixed slot. `Mark` gains `shape: "disc" | "box"` and a
  `blank` variant: box = a poll category, disc = a config's verdict. `gate clear` leads
  with a `Swatch` instead, so the gate pays in its own colour.
- `LedgerEntry.detail: ReactNode` → `notes: readonly string[]`, each rendered as a muted
  `Chip`. The screen owns the chip treatment; the caller supplies fragments, not markup.
- Fixed gridlines: `LEAD` size-4, `NAME` min-w-32, `NOTES` w-44, value `ml-auto`. The row
  still spans full width; the slack falls between notes and figure so the figures stay
  hard right and the notes start on one line down the column. The total row is `pl-7` so
  it starts on the names' gridline, not the marks'.
- `MarkVerdict` split out of `MarkVariant`. `blank` is the absence of a verdict, so
  callers ranking verdicts (`PollScreen`'s worst-status rail) stay exhaustive over four,
  not five — adding `blank` had silently broken that `satisfies`.

**Not adopted from the mock:** the headers stay lower case (`coverage` / `storage`). #73
draws them in caps, but 'prevent using CAPS' was an explicit instruction two passes ago
and no other label in the theme is capitalised.

## Follow-up — Tracking toolbar

Second Storybook global beside Font, on the same wrapper (both are inherited text
properties). Four values: 0.01em (today's base rule), −0.025em and −0.05em (Tailwind's
`tracking-tight` / `tracking-tighter`, so a winner is a utility not a magic number), and
−0.5px fixed.

The base rule's 0.01em was set for a narrower face than Space Mono, which is why this is
worth testing at all. Note the px option does not scale with size — at `text-xxs` it bites
roughly twice as hard as at `text-ask`.

## Follow-up — outcome marks, strip removed, toggle recentred

- **Coverage marks state the poll outcome per category**, using `Mark`'s existing
  verdicts: `blank` when the category drew no polls, `fail` wrong, `warn` ("!") partial,
  `pass` correct. Fixtures gained a `vue` row worth +0 so the no-polls case is on screen.
- **Polls strip deleted**, and `Outcomes.ui.tsx` with it (plus its spec and stories) —
  the per-category marks now carry the same news. `Review answers` moved into the footer
  opposite `Enter shop`, so the whole row of chrome is gone rather than left half empty.
- `outcomes` narrowed from `readonly OutcomeItem[]` to `readonly CrumbVerdict[]`: nothing
  renders per poll any more, so nothing should carry a poll number. It still feeds the
  "4 of 5 correct" chip.
- Disclosure **centred** (`justify-center`), stepped up to `size="body"`, and **open by
  default** in the stories.

**Note:** the toggle's label was changed on disk to "Expand details" / "Collapse
details" mid-pass. Kept as found; the specs now assert that wording. Mock #77 says
"show where it came from".

## Follow-up — the not-earned verdict

`RewardScreen` became one screen with two verdicts rather than two screens: a
discriminated `outcome: "cleared" | "held"` union carries `clearedGate`/`spendableKb`/
`onContinue` on one branch and `peelCount`/`onChoosePeel` on the other. Everything above
the footer is the same report, which is the point — the two must not drift.

- `swatchName` → `gateName`. The screen builds "Lavender Swatch" the way `swatch.model`
  does, and the peel sentence needs the bare gate name anyway.
- `Swatch` gains `pending`: dashed hollow square, for a gate reached and not won. Used at
  award size and as the track pip. `SwatchTrackItem` admits it alongside `locked` — neither
  owns a colour, so neither may name one.
- `LedgerEntry.dimmed` for a line that never fired (`gate clear · not paid`), and
  `LedgerProps.footer` to override the computed total. The shortfall is measured against a
  demand the column knows nothing about, so only the screen can state it.
- The coverage chip turns cinnabar-tinted whenever the demand is unmet — keyed off the
  demand, not the verdict, so a clear that falls short of the next rung says so too.

**Not adopted from mock #78:** the `⋯` overflow (still a stub with nothing behind it),
the polls strip (removed last pass at your request), and the caps headers.

## Follow-up — tracking chosen

−0.025em wins. The base rule in `app.css` now reads `letter-spacing: var(--tracking-tight)`
rather than the literal, so it names Tailwind's scale instead of a magic number. The old
0.01em survives in the toolbar as `loose (was)` for comparison; the default global is now
`tight`, matching the base.

**App-wide, not reskin-only** — the base rule is on `html, body`, so every existing screen
tightens too. The old value was chosen for JetBrains Mono and had every label running
loose.
