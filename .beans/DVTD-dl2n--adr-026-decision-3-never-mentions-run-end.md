---
# DVTD-dl2n
title: ADR-026 Decision 3 never mentions run end
status: todo
type: task
created_at: 2026-09-22T18:49:42Z
updated_at: 2026-09-22T18:49:42Z
parent: DVTD-82c4
---

Split out of DVTD-6vw2, whose screen shipped.

ADR-026 Decision 3 (`docs/adr/026-staged-onboarding-starter-stacks.md:63`) settled that
**the gate clear is a payoff, not a report**, and routes straight into spending the
storage at the shop. Run end is the same shape one screen later — a run produces banked
meta storage, swatches, dex progress and a pile of wrong answers — and the ADR says
nothing about it.

Verified 2026-09-22: a case-insensitive grep for
`run end|run over|end the run|game over|final|last poll|exhaust` over the whole 115-line
file returns **zero matches**. Its sole amendment (`:69`, 'the payoff itemizes its own
storage') is gate-clear only — 'the gate's name', 'the failed gate's screen', 'what it
actually paid this gate'.

Now that the run-over screen exists and is adopted on `/run/over`, the principle it was
built on is undocumented.

Fold in one more sentence while writing it: `/run/community` is deliberately **outside**
the policed route set (`runRoutes.viewmodel.ts:16`), which is why the run-over screen can
offer it as an aside without `routesForStatus` ever allowing a second route. That
non-obvious fact currently lives only in a closed bean.

- [ ] Amend ADR-026 Decision 3 to cover run end, or write the sibling ADR
- [ ] State why `/run/community` sits outside the policed set
