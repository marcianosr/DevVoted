---
# DVTD-ud69
title: 'Check Volkswagen config: balance and perceived risk'
status: scrapped
type: task
priority: high
created_at: 2026-08-13T15:37:18Z
updated_at: 2026-09-04T18:44:38Z
parent: DVTD-u35m
---

Rewritten for ADR-035: Volkswagen CI now suppresses the gate's first audit. Validate balance - does a 384KB skip-Marsh/skip-Volcano trivialize the flagship audits, or is its real home the strip audits at gates 11/12? Confirm the struck-through 'reported passing' receipt row lands as visible fraud.


## Reasons for Scrapping

Scrapped 2026-09-04. The bean's premise no longer describes the game.

It asked whether a 384 KB "skip-Marsh / skip-Volcano" config trivializes the
flagship gate audits. ADR-056 then made audits **drawn, not scheduled**:
`auditSchedule.model.ts:109` draws from POOL_A for gates 4 to 7, POOL_B for 8 to
10, and POOL_C for 11 with only `strip` pinned. Marsh and Volcano are swatch
names (`swatch.model.ts:108`, `:110`), not audit fixtures, so there is no
flagship audit at a known gate left to skip.

`volkswagenCi` is still live and unchanged (8 slots, 384 KB draft,
`suppressesAudit: true`, consumed at `audit.model.ts:270`). If its balance needs
a look again, the honest question is different: whether 384 KB to suppress one of
the one-to-two drawn audits per gate is priced right in bands b and c. That is a
new bean against the drawn schedule, not this one.
