---
# DVTD-jgpo
title: 'Config: Monorepo merges two category configs into one'
status: draft
type: feature
priority: critical
created_at: 2026-09-22T11:23:19Z
updated_at: 2026-09-24T12:49:18Z
parent: DVTD-72d9
---

**What:** A shop service that merges two category configs into one, keeping both effects at the weight of one.

**Why:** Buys back build space, at the price of one failure point holding both.

## Done when
- [ ] A merged config weighs one, and both category effects still fire
- [ ] It can never be split, and selling or losing it loses both
- [ ] It counts as one config for audits and for targeting
- [ ] Decided: how the panel shows two versions, and how an upgrade picks one
- [ ] Decided: what an outage on a merged config switches off

## Notes

Monorepo is a **transformation**, not an installed config. It sits beside Minify:
a service you buy that changes the build rather than joining it.

**Create monorepo · 64 KB** — merge two installed 1-weight Focus configs into one
combined 1-weight config.

    .js L2      1 weight
    .ts L1      1 weight
          ↓ monorepo
    js + ts     1 weight

Both category effects survive: JS polls use the `.js` level, TS polls use the
`.ts` level. Each child is still upgradable separately, through the combined
panel.

## Trade-offs

- The configs can never be separated again.
- An outage affecting the monorepo disables both effects.
- Selling or peeling it loses both.
- It counts as **one** config for Dependabot and for targeting.
- Maximum one monorepo per run, initially.

The choice: save one weight, possibly dropping to a cheaper build-space rung,
against concentrating two useful configs into a single failure point.

## Why a transformation

A Monorepo that occupied a slot would cancel the space it saves. Buying it as a
service avoids that entirely.

## Rollout

An **occasional Registry service**, not a permanent shop button. Tests whether
merging configs is fun before an entire consumable system gets built around it.

## Open

- Which panel shows a merged config's two levels, and how upgrades target one child
- What an outage on a merged config disables: both arms, or the matching one
- Whether the 1-weight restriction holds, or any two Focus configs can merge
- How the Dex renders a merged config

## Supersedes

Replaces the Monorepo written up as Config 1 of **DVTD-kgka**, which was a
category-bonus passive ("every category config fires on every poll"). Same name,
unrelated mechanic.
