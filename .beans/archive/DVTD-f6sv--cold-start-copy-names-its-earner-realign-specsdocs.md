---
# DVTD-f6sv
title: Cold Start copy names its earner; realign specs/docs to 0.25 focus-multiplier step
status: completed
type: task
created_at: 2026-08-04T16:44:57Z
updated_at: 2026-08-04T16:44:57Z
---

Cold Start card read 'Then it earns ×2 coverage' — unclear what earns and when. New copy: 'Get each gate's first answer right / Then that answer earns ×2 coverage' (description matches). Alongside: Marciano rebalanced focusCoverageMultiplier to 1 + 0.25 × level (L1 ×1.25, L2 ×1.5); realigned 15 failing spec assertions (pipeline/effect/config/configRole/ShopScreen), the 10 static focus roster descriptions, wiki formulas + worked example (+3.3%), and CHANGELOG quotes. Also routed the two remaining static-description display paths (shop draft offers, gate report passed rows) through describeConfig so descriptions derive too.

## Summary of Changes
All copy for focus configs (description/gives/needs) now derives from level at every display path; the roster keeps descriptions only as fallback text. Verified: 1021 tests, oxlint + depcruise + tsc clean.
