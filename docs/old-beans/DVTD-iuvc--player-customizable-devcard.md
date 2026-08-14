---
# DVTD-iuvc
title: Player-customizable DevCard
status: draft
type: feature
priority: normal
created_at: 2026-05-28T08:42:26Z
updated_at: 2026-05-28T08:42:26Z
parent: DVTD-3wpy
---

Allow players to customize their DevCard's appearance — beyond what awards/category data automatically dictate.

## Status: Draft

This needs refinement before it can be worked on. There's a real design tension with existing decisions.

## The tension

Current DevCard design (per [[DVTD-x4s4]] redesign + the Player Identity epic) is **fully data-driven**:

- Border color = dominant category (Vermillion=HTML, Saffron=JS, etc.) — earned, not chosen
- Pinnacle award shown = most prestigious earned — auto-selected
- Awards system principle: **"Automatic — never customizable."**

If customization is added, what's customizable without breaking that principle?

## Possible scopes (pick one or more before promoting to todo)

1. **Cosmetic-only** — frame skins, foil/holo effects, background patterns. Identity (border color, awards) stays data-driven; players just pick a "finish." Closest to TCG card variants.
2. **Pinnacle slot** — if a player has multiple earned awards, let them choose which one is the pinnacle. Doesn't break "automatic" because every choice still had to be earned.
3. **Display name / pronouns / tagline** — pure metadata, no mechanical impact.
4. **Override category border** — most controversial; directly contradicts the existing rule. Only on the table if we're consciously revising the rule.

## Open Questions

- Are customization items earned (via storage/economy) or freely chosen?
- Does this interact with the economy domain (configs as currency-purchasable cosmetics)?
- Per-run DevCard variant (future scope from memory notes) — does this customization apply to all-time card only, or both?

## Todo

- [ ] Resolve scope (which of the four options, or another)
- [ ] Decide acquisition model (earned vs free vs purchased)
- [ ] Update the Player Identity epic notes if the "automatic" principle is revised
- [ ] Promote to todo once scope is locked
