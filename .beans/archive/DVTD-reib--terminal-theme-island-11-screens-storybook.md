---
# DVTD-reib
title: 'Terminal theme island: 11 screens + storybook'
status: completed
type: feature
priority: normal
created_at: 2026-08-31T13:40:58Z
updated_at: 2026-08-31T14:04:24Z
---

New src/ui/terminal-theme/ island recreating 11 mockup screens (home, prep, new run, poll, reveal, gate clear, gate hold, review, shop, game over, dex) in a terminal visual language. Stories only, Storybook only. Copy rules: peel->remove, no 'needs N' labels, figures in badges, max 800px panel, bg-theme-soft fills, rainbow upgrade via legendary-ring.

## Summary of Changes

Built src/ui/terminal-theme/ as a fresh island (no modern-theme imports): 22 primitives + 2 token maps (tones.ts, families.ts) + 11 screens in screens/, every component with a .stories.tsx (titles Terminal/* and Terminal/Screens/*). Stories only, Storybook only, per scope decision.

- Copy rules: peel→remove everywhere; 'needs N' labels dropped (locked rows just dim); every ×/+/− figure renders in a Badge (Figures.ui tokenizer).
- Panel: max-w-[800px], rounded-2xl, bg-zinc-950 on a zinc-900 story ground; gate theming via data-swatch-theme + bg-theme-soft.
- Upgrade button rainbow via the global .legendary-ring class.
- Storage plan ladder kept in ShopScreen (6-tier disclosure + next-tier row + change →).

Verification: oxlint ✓, depcruise ✓ (island auto-covered by ui-stays-presentational), tsc --noEmit ✓, stories typechecked via temp root tsconfig (removed after) ✓, vitest 2622 passed / 3 failed — the 3 are pre-existing in modern-theme RewardScreen.spec.tsx (file untouched, nothing imports terminal-theme).

Storybook must be RESTARTED to see the panel styling (stale-Tailwind gotcha: max-w-[800px]/rounded-2xl/px-7 are new utilities).
