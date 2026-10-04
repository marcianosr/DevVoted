---
# DVTD-kf93
title: 'Config: --save-exact'
status: scrapped
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:05Z
updated_at: 2026-09-15T14:03:59Z
parent: DVTD-72d9
---

Draft 20% cheaper, can't sell

## Reasons for Scrapping

Superseded by DVTD-5cut (`vendor-lock-in`, ADR-087), which owns the unsellability axis.

Both configs priced the same drawback, "can't sell", and $--save-exact bought less with it: a 20% draft discount on itself. vendor-lock-in spends the restriction on a different config and buys build space, which under ADR-082 is a recurring per-gate bill rather than a one-off saving. Two configs whose cost is the identical restriction is roster duplication, so the axis goes to the one that pays more for it.
