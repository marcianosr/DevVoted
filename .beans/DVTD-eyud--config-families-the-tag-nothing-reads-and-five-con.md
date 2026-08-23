---
# DVTD-eyud
title: 'Config families: the tag nothing reads, and five configs it gets wrong'
status: todo
type: task
priority: normal
created_at: 2026-08-23T17:23:49Z
updated_at: 2026-08-23T17:23:49Z
---

`ConfigFamily = "focus" | "defense" | "risk" | "amplify" | "economy"` is declared in `config.model.ts:4` and set on all 30 configs, but **read by nothing** — grep finds no consumer outside the roster and the type. Surfacing it on the modern start screen (DVTD-7gty) turned up five tags that disagree with the effects they sit on. Intellisense was fixed in that session; these are the rest.

- [ ] **Code Coverage is `amplify`** but its only effect is `coverageAdd: 0.5` — flat, never a multiplier. Every other `amplify` config multiplies. Either widen what `amplify` means or move it.
- [ ] **`defense` holds two unrelated jobs.** ESLint, Stylelint and Telemetry are paid mid-poll tools with an escalating fee. Prefetch is passive information with nothing to press and no fee. A player-facing gloss ("something you press mid-poll") fits three of the four.
- [ ] **Freemium is `economy`** but it is the roster's only recurring bill. Under the gloss "earns you KB" it reads backwards.
- [ ] **Dependabot is `economy`** but pays in config levels, the one axis nothing else pays in (see the 2026-08-20 decision note).
- [ ] **WTFPL is `economy`** but changes what the shop stocks rather than what you earn.

Underneath all five is one structural question: **`family` mixes what a config pays with what it costs.** Deprecated (`amplify`), Overclock (`risk`) and Freemium (`economy`) are all "big upside, real cost", but that is a second axis crossing three families — a gamble is a property a payout can have, not a payout of its own. Decide whether `family` stays one tag or splits into payout + a risk flag before renaming anything.

The modern start screen renders the five as CATEGORY / MULTIPLIER / STORAGE / TOOL / GAMBLE with player-facing glosses, so whatever this bean settles has a surface waiting for it (`src/ui/modern-theme/screens/StartScreen.ui.tsx`, local `ConfigFamily` union).
