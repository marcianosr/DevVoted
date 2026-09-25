---
# DVTD-x8py
title: 'Config: Math.random() acts as a different config each poll'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-24T12:49:17Z
parent: DVTD-72d9
---

**What:** A config that behaves as a random other config, re-rolled every poll.

**Why:** An idea, not a design yet.

⚠️ The same name is designed differently in DVTD-krh0, where it rolls a die once per gate. Reconcile the two before building either.

## Done when
- [ ] Reconciled with the per-gate die that carries the same name
- [ ] What it can turn into, and how the roll is seeded, is decided
- [ ] A spec covers the roll surviving a reload

## Notes

Random config per poll
