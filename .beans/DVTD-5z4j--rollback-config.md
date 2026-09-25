---
# DVTD-5z4j
title: 'Config: Rollback'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-16T07:47:20Z
updated_at: 2026-09-24T12:49:15Z
parent: DVTD-72d9
---

**What:** A config that lets you pay 64 KB to answer a poll a second time.

**Why:** Buys a second chance at the price of that poll's score.

## Done when
- [ ] Rollback can be drafted and installed
- [ ] Paying 64 KB after answering re-opens the same poll
- [ ] The first answer pays no coverage
- [ ] It cannot be used to undo a wrong answer an audit is scoring

## Notes

After submitting, pay 64 KB to revert your answer and answer again. The original poll pays no coverage.

Note (2026-08-17): under the Marsh audit (ADR-035), rolling back a WRONG answer is rolling back points. Rollback needs a Marsh-aware guard or copy.
