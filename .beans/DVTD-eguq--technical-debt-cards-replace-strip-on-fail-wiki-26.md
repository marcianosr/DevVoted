---
# DVTD-eguq
title: 'Technical debt cards: replace strip-on-fail (wiki §2.6)'
status: todo
type: feature
created_at: 2026-07-31T11:02:26Z
updated_at: 2026-07-31T11:02:26Z
---

The wiki's failure model (§2.6) is unimplemented: a failed check plants a **debt card** on the failing config — effect disabled, check stays live — drawn from a shared 12-card pool, each with its own resolve condition (correctness / coverage thresholds / breadth / build actions). Debt doesn't stack; storage pay-off doubles per run; the run ends only when every slot holds debt.

This replaces the current strip-on-fail flow (`closeWindow` → "awaiting-strip" → `strip()`/`resumeClimb` in `src/modules/run/climb/run.model.ts`) and answers DVTD-civm's open death-model question ("fully debted" as the terminal state).

Scoped out of DVTD-77ke (the Config Rule) on 2026-07-31; the Config Rule's per-config checks are the prerequisite and are now shipped.

## Todos

- [ ] Debt card pool model (12 cards, resolve conditions across the four dials)
- [ ] Effect-disabled-but-check-live state on installed configs
- [ ] Resolve-condition tracking spanning polls/gates (outlives the window)
- [ ] Storage pay-off with per-run doubling price
- [ ] Fully-debted run end; retire strip-on-fail + StripScreen
- [ ] Persistence (snapshot fields; reconcile DVTD-civm)
