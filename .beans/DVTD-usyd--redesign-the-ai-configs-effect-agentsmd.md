---
# DVTD-usyd
title: Redesign the AI config's effect (AGENTS.md)
status: draft
type: feature
priority: normal
created_at: 2026-08-07T15:37:54Z
updated_at: 2026-08-07T15:37:54Z
---

AGENTS.md (formerly Copilot) is the roster's only legendary and its effect is `All coverage ×2`, which is bland and overlaps two other configs: Intellisense is ×1.5 all coverage and the Coverage config is ×2 on gains.

**Ruled out (Marciano, 2026-08-07): option manipulation.** The obvious "AI suggests an option, usually right, trust it or not" mechanic occupies the same decision space as the linters (ESLint/Stylelint already own "something helps me pick an option on this poll"). A probabilistic hint next to a reliable cross-out is the same tool, only worse, and the linters have the nicer economy already (escalating fee plus a pledge).

Design space no config touches yet, as candidate directions:
- **Draw steering**: one poll each gate comes from a category your build cares about. Directly fixes the dead weight of focus configs whose category never appears, and nothing else influences the draw.
- **Answer-for-you**: the AI answers one poll, no coverage earned. Thematic for a learning game (coverage is the score, so learning nothing scores nothing) and mechanically new: it removes variance rather than improving odds.
- **Risk family**: `family: "risk"` and `rewardMultiplier` both exist in the engine and are unused since ADR-016 §3 left them for future Risk-configs. Double coverage and double the wrong-answer bleed.

Not urgent. The hole it caused is closed (DVTD-ezij gave it `min-correct: 1`), so this is pure design upside.
