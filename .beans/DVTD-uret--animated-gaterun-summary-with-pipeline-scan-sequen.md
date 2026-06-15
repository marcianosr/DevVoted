---
# DVTD-uret
title: Animated gate/run summary with pipeline scan sequence
status: todo
type: feature
priority: high
created_at: 2026-06-15T07:33:01Z
updated_at: 2026-06-15T07:33:01Z
parent: DVTD-3y20
---

Currently the game-over / end-of-gate screen lacks ceremony. It should replay the just-completed gate as a per-poll breakdown, then animate a CI Pipeline "scanning" those results before showing the final coverage delta. This is the highest-emotion moment in a roguelike and is what people screenshot and share.

## Vision

After completing a gate, show:

**Gate 4 summary:**
```
1: JavaScript      ✅ +2.0% Coverage
2: TypeScript      ❌ -1.0% Coverage
3: JavaScript      ✅ +2.5% Coverage
4: General Frontend ❌ -1.0% Coverage
5: React           ✅ +3.5% Coverage

Total Coverage: 45%
Coverage Gained: +6.0%
```

Then a CI Pipeline animation runs over these 5 results — each line lights up one by one as if being scanned, then its check turns green (correct) or red (incorrect) in sequence. Final coverage delta lands last.

## Why this matters

- Coverage feedback today is hidden inside the Pipeline tab on the results screen — strangers don't click it and miss the loop entirely
- A per-poll replay with a scan animation makes the roguelike framing visible at the moment players care most
- Creates a natural screenshot/share moment (ties into [[DVTD-pbby]] end-of-run share prompt and [[DVTD-vp01]] shareable DevCard)

## Acceptance criteria

- [ ] After a gate completes, show a per-poll list: index, category, correctness icon, coverage delta
- [ ] Pipeline "scan" animation traverses the list sequentially (configurable speed, default ~300ms per row)
- [ ] Each row's check transitions from neutral → green or red during scan
- [ ] Final two lines (Total Coverage, Coverage Gained) appear after the scan completes
- [ ] Animation is skippable (tap/click to fast-forward to final state)
- [ ] Reduced-motion users get the final state immediately, no scan
- [ ] Works for the final game-over screen as well as per-gate summaries

## Open questions

- Should this play after every gate, or only on game-over / run completion?
- Do we want sound (CI pipeline running, checkmark ding)?
- How does this compose with the upgrade card draft moment that currently fires post-gate?
