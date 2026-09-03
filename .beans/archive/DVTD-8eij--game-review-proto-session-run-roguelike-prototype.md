---
# DVTD-8eij
title: 'Game review: proto-session-run roguelike prototype'
status: completed
type: task
priority: normal
created_at: 2026-07-16T12:24:32Z
updated_at: 2026-07-16T13:11:19Z
---

Playtest and review the new roguelike session-run prototype at /proto-session-run against ADR-005/006 design intent. Assess fun factor and improvement opportunities.

## Summary of Changes

Full playtest completed via gameplay-tester agent (browser automation against localhost:3005/proto-session-run): built a starter pipeline, cleared all 5 gates, forced a deliberate fail to test strip-on-fail, recovered, reached victory.

**Verdict:** core checklist/fail-transparency loop is genuinely good and matches ADR-006's intent (gate 1 trivial as designed, live checklist never opaque, strip-on-fail felt fair). But not "fun-complete" — a balance hole undercuts the central "self-imposed difficulty" pitch.

**Key findings:**
- Bug: reward screen doesn't enforce "pick exactly one" (ADR-006 Decision 7) — could take slot + draft + another slot in one gate-clear round, breaking the documented 5-slot cap.
- Undocumented 20KB draft cost not covered in ADR-006's economy section.
- No incentive to re-engage Focus/Check/Risk configs after a fail — a bare Defense+Economy build is strictly dominant for the rest of the run once burned once (gates 4-5 had zero tension).
- Stale copy: baseline requirement text ("Requires 1 correct") doesn't update as it escalates to 2/3; same on an upgrade card.
- "Unit Tests" pseudo-config appears unintroduced/untooltipped from gate 2 on.
- React hydration error in console (nested `<p>` in ConfigChip tooltip).
- Anticlimactic victory screen (no build recap/coverage breakdown).

**Top recommended fixes, ranked:** (1) enforce one-reward-per-clear + slot cap, (2) remove the safe-build escape hatch / give bare builds a reason to stay risky, (3) fix stale requirement copy + tooltip gaps.
