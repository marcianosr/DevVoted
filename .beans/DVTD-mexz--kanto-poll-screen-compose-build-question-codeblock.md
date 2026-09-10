---
# DVTD-mexz
title: 'Kanto poll screen: compose Build, Question, CodeBlock and PollScreen'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T12:12:07Z
updated_at: 2026-09-09T12:29:55Z
---

First composition of the kanto kit into a real screen, from two mocks (folded / unfolded build band).

Excluded by decision: coverage bar and the payout reading (not built). Choice keeps its borderless rows. Build title is "Build", not "BUILD".

- [x] shared/lib/syntaxHighlight.ts: lift highlightOptions out of PollMarkdown.ui.tsx
- [x] CodeBlock.ui.tsx: themed, hljs-highlighted code panel
- [x] ConfigChip: skipped state
- [x] Header: balance
- [x] Build.ui.tsx: title line, chip grid, skipped fold
- [x] Question.ui.tsx: category, question, code, choices
- [x] PollScreen.ui.tsx: the composition
- [x] Stories for all four, covering audits/configs/picks/length/code axes
- [x] Specs for all four plus the two modified
- [x] lint + typecheck (app + stories) + tests

## Summary of Changes

Four new components in `src/ui/kanto-theme/`, two modified, one shared helper lifted.

- `~/shared/lib/syntaxHighlight.ts`: the highlight.js language registry, lifted out of `PollMarkdown.ui.tsx` so the module renderer and the kanto one cannot drift. `src/ui -> src/shared` is unrestricted; only `src/ui -> src/modules` runtime imports are blocked.
- `CodeBlock.ui.tsx`: themed code panel. Two traps: the global `.markdown` class hardcodes zinc, and `github-dark.css` (imported at `app.css:2`) pins `.hljs { background:#0d1117 }` on the `<code>`, which paints over any themed ground. Both handled — the panel wears `bg-theme-raised` and clears hljs's background with `[&_code]:bg-transparent [&_pre]:bg-transparent`.
- `ConfigChip`: new `skipped` state, peer to `lost`. `skipped` dims the whole chip and mutes the name; `lost` still wins the strike when both are set. Independent axes: `lost` is knocked offline by an audit, `skipped` has nothing to do this poll.
- `Header`: optional `balance`, three spans on the title row so the mock's colour split survives (amount faint + tabular, unit muted, the word `balance` in full theme).
- `Build.ui.tsx`: title line, chip grid, skipped fold. Follows the repo's `<details>` idiom (`BuildList.ui.tsx`, `Section.ui.tsx`) with a `group-open/skipped:rotate-90` caret, so the fold works with zero hooks in a Tier-1 file. Counts the total itself (`configs.length + skipped.length`) but takes `paying`/`ready` as numbers — counting is formatting, classifying a config is not.
- `Question.ui.tsx`: category badge, `n options / answer type`, question, optional code, choices. `onPick` reports the option id, never the letter.
- `PollScreen.ui.tsx`: one column — header, audits, build, trail + wrong-cost, question, hint, optional author.
- `~/test/kantoPoll.factory.ts`: the mock's roster, audits and poll as fixtures for both stories and specs. Specs cannot pull runtime values out of `src/modules`, so anything real (`auditAt`) routes through here.

Excluded by decision: the coverage bar and the `this poll pays x11.4` reading (nothing to build them from yet), and any change to `Choice` — the mock draws bordered answer rows, the shipped borderless rows won.

Stories cover the requested axes: audits (none/one/two/three), config states (running, usable, pending, fading, stopped, skipped, locked), picked vs unpicked, long vs short answers, and code vs no code.

Verified: `npm run lint` clean (875 modules, 3573 dependencies), `tsc --noEmit` clean, no kanto story type errors under a scratchpad config that drops the stories exclude (30 errors remain repo-wide, all pre-existing and in untouched files), `npm test` 209 files / 3621 passed (+52) / 6 skipped / 2 todo.

## Deferred

- Coverage gauge and the payout reading.
- Pressable configs. The `Default` story shows the mock's "tap any config to open it" hint over a band that has no press affordance and no detail surface to open.
- `Swatch.stories.tsx` and `SwatchTrack.spec.tsx` are still the only two gaps in the kit's story/spec matrix.
- 30 pre-existing story type errors across `old-theme`, `terminal-theme` and `modules` stories, invisible to `npm run build` because `**/*.stories.tsx` is excluded from tsconfig.
- Nothing here is wired into `src/routes/`; kanto is still Storybook-only.

## Follow-up: chip geometry

Marciano measured the chip at 30px; the mock calls for 38. `CHIP` moved from `px-2.5 py-1 text-xs` to `px-4 py-2 text-sm`: 8px padding + a 20px line box + 1px of border a side = 38px, on 8/16 padding at 14px. The badge inside is unchanged and stays 20px tall (`py-0.5` + a 16px line), so it never drives the height. Three specs pin the padding, the type size, and locked-matches-unlocked.

Verified again: lint clean (875 modules), tsc clean, `npm test` 209 files / 3624 passed / 6 skipped / 2 todo.
