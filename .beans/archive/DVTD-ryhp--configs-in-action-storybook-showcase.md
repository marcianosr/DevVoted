---
# DVTD-ryhp
title: Configs-in-action Storybook showcase
status: completed
type: task
priority: normal
created_at: 2026-09-03T08:30:28Z
updated_at: 2026-09-03T08:35:02Z
---

One story per config surface, driven by the real engine (createRun + runReducer + toRunView) so every figure is true. Poll-screen actors (focus, linters, telemetry, .length, Cache cold/warm, Cold Start, Overclock, amplifiers, A/B arm A), reveal actors (IndexedDB, Cache equation), shop actors (Freemium, WTFPL, A/B switch), gate-clear actors (Unit Tests + Moore's Law, Dependabot, Deprecated), prep (Prefetch), audits (Volkswagen). Game-design reason: seeing each config's effect at its acting moment is how build feel gets tuned.

## Summary of Changes

`src/ui/terminal-theme/screens/ConfigsInAction.stories.tsx` — 20 stories under "Terminal/Configs in action", each driven by the real engine: createRun with a preset build → runReducer answers → toRunView → the Tier-2 view for the surface where the config acts. No mocked figures; every multiplier/KB on screen is what the engine paid.

- Poll screen: FocusPaysItsCategory, LintersSellCrossouts, TelemetryPeeksTheSplit, LengthCountsTheGate, CacheColdOnFirstSight, ColdStartDoublesTheOpener, OverclockRunsHotAfter, AmplifiersStack, AbTestShipsArmA, VolkswagenGreensTheAudit (startAtGate 3 so an audit is live to suppress)
- Reveal: CacheWarmPaysTheRepeat (×1.5 in the equation), OverclockBurnsTheOpener (×4), IndexedDbDripsStorage (+8 KB)
- Shop: AbTestSwitchesInTheShop (⇄ press), FreemiumHalvesTheShelf, WtfplOpensEveryShop, DeprecatedFadesOnClear
- Gate clear: GateClearPaysTheEconomy (Unit Tests + Moore's Law interest), DependabotMergesAnUpgrade (iterates seeds until the 1-in-3 fires, still real engine output)
- Prep: PrefetchReadsAhead

Placed in src/ui because dependency-cruiser exempts src/ui stories from the runtime-import rule. Verified three ways: scratchpad tsconfig typecheck (stories are excluded from the project tsconfig — build would not have caught errors), a throwaway vitest smoke render of all 20 stories (20/20 render, spec deleted after), and lint:arch clean.
