---
# DVTD-hk3h
title: Balatro-style coverage equation reveal
status: completed
type: feature
priority: normal
created_at: 2026-07-20T09:09:43Z
updated_at: 2026-07-20T10:07:51Z
---

Animate CoverageEquation.ui.tsx so the last answer's coverage resolves Balatro-style: chips fire one-at-a-time (base first, then each bonus), each pops with a floating delta, the '= earned' total counts up as a running subtotal per chip, then the category coverage bar fills previous->new and the streak line fades in. Pure Tier 1 (src/ui/runs/), plain props unchanged. Respect prefers-reduced-motion (snap to final).

## Todos
- [x] Add a useCoverageReveal sequencing hook (steps through [base, ...bonuses], drives active index + running subtotal, respects reduced motion)
- [x] Wire CoverageEquation chips to reveal state (dimmed until fired, pop + highlight when active)
- [x] Drive the '= total' from the running subtotal instead of static earnedCoverage
- [~] Floating delta per chip on fire (dropped: chose "= total counts up" over floating deltas)
- [x] Gate bar fill + streak line until sequence completes
- [x] Update story with a play-through / long sequence
- [x] Add/adjust spec (reduced-motion snaps to final; total ends at earnedCoverage)

## Summary of Changes

- New Tier-1 hook src/ui/hooks/useCoverageReveal.ts: fires chips one-at-a-time via setInterval, running total tweens per step (useCountUp from prev->current subtotal), serialized-values key avoids restart on array-identity churn, reduced-motion snaps to final.
- CoverageEquation.ui.tsx wired to the hook: chips dim until fired + pop when active, = total counts up per step, bar fill + streak line gated on isComplete.
- Added LongSequence story; added useCoverageReveal.spec.ts (3 tests). No server/scoring changes — all data already in props.

## Pivot (compact + modules)

Per user feedback: (1) more compact single-line layout like the reference image; (2) build in src/modules/, not src/domains/.

- Reverted my animation edits to the legacy src/ui/runs/CoverageEquation.ui.tsx + stories (keeps /pipelines untouched).
- Kept the shared hook src/ui/hooks/useCoverageReveal.ts (+ spec) — src/ui is allowed, not domains.
- New compact component src/modules/run/presentation/run/CoverageEquation.ui.tsx: single font-mono line, design-system tones (pewter/viridian/cinnabar + Paragraph), Balatro reveal (terms fire left-to-right, '=' counts up per term, '→ new%' reveals at the end). Coverage-% post-answer, no scoring changes.
- Added CoverageEquation.stories.tsx (Correct/Missed/MultipleBonuses) + CoverageEquation.spec.tsx (2 tests). typecheck + oxlint + depcruise + 5 specs green.

## Open: live wiring into /run reveal
Not yet wired. RunView exposes coverageByCategory (prev vs reveal.result.data), coverageMultiplier, coverageAdd, answeredThisGate. Base/Config decomposition would be a PRESENTATIONAL derivation (no scoring change) but config attribution is approximate when focus-category coverage configs exist. Decision pending: accept approximate single 'Config' chip vs store the breakdown (scoring change, user vetoed) vs single base term only.

## Config chips wired (resolved open item)

Chose the per-config chip option. Added src/modules/run/presentation/run/coverageEquation.ts (buildCoverageEquation): presentational reconstruction that mirrors coverageForAnswer (earned = share × (∏mult + ∑add)) to split the run's net per-category coverage into base + one chip per active config (config.label). Base is the remainder so chips always sum to earned; a net loss is all-base (configs never touch losses); focus configs only chip on their category. Wired into RunGame during the post-answer reveal beat.

Files: coverageEquation.ts + coverageEquation.spec.ts (3 tests, real CONFIGS fixture); RunGame.component.tsx renders <CoverageEquation> from buildCoverageEquation. Verified: tsc clean, oxlint clean, depcruise 505 modules no violations, 25 specs pass (incl. RunGame).

Known limit: reveal beat is ANSWER_REVEAL_MS=2000ms; at stepMs=450 the sequence fits ~1-2 config chips comfortably but 3+ could be cut. Follow-up if needed: sync reveal duration to chip count or speed up stepMs. Live end-to-end (full run in browser) not driven — Chrome extension unresponsive this session; validated via unit tests + user-confirmed visual (image #4).
