---
# DVTD-0h1w
title: 'Terminal theme: mobile variants for the 11 screens'
status: completed
type: feature
priority: normal
created_at: 2026-08-31T20:07:41Z
updated_at: 2026-08-31T20:12:45Z
---

Container-query-driven mobile layout for src/ui/terminal-theme: Panel becomes @container, @max-md: overrides on screens/primitives, plus a Mobile story per screen rendered in a 390px frame.

## Summary of Changes

- Panel.ui: split into an outer `@container` frame (mx-auto, max-w-[800px]) and the inner article; panel padding tightens below @md (448px container width).
- All mobile styling is container-query driven (`@max-md:` overrides), not viewport breakpoints — so the Mobile stories work as a plain 390px wrapper div, and screens adapt wherever they're mounted.
- Row.ui: name column w-36 → w-28 under @max-md.
- Home/Prep callouts stack (note above a stretched primary button); Prep/NewRun/Review primary buttons go full-width; Shop/GateClear/GateHold/GameOver primaries get flex-1 next to their quiet sibling; GateClear/GateHold/GameOver headers stack; Review rows top-align for wrapped questions.
- Poll/Reveal/Dex needed no CSS changes (already collapse cleanly); all 11 screens got a `Mobile` story spreading the canonical story inside the 390px frame.

Verification: oxlint + depcruise ✓, tsc --noEmit ✓, stories typechecked via temp root tsconfig (removed after) — 0 terminal-theme errors, pre-existing errors in legacy/modern-theme stories remain ✓, vitest 2622 passed / 3 failed (same pre-existing modern-theme RewardScreen.spec.tsx failures as DVTD-reib).

Storybook must be RESTARTED: @container and @max-md:* utilities are new to the codebase (stale-Tailwind gotcha).
