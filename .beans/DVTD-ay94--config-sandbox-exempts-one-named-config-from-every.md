---
# DVTD-ay94
title: 'Config: Sandbox shields one config from audits'
status: todo
type: feature
priority: normal
created_at: 2026-09-16T18:23:09Z
updated_at: 2026-09-24T12:49:12Z
parent: DVTD-72d9
---

**What:** Name one config at the start of a gate, and no audit can take it offline.

**Why:** The only audit protection today cancels a whole audit; this one removes a target instead.

⚠️ Blocked on its price. "Other configs cannot enhance it" means nothing here, because configs never enhance each other. Pick a real price first.

## Done when
- [ ] The price is decided and written down
- [ ] The named config cannot be taken offline by any audit for that gate
- [ ] The pick clears at the end of each gate, and cannot name itself
- [ ] Specs cover every audit that takes a config offline

## Notes

Name one config at gate start. Audits cannot take it offline. In exchange other
configs cannot enhance it.

## What audits can actually do to a config

Exactly one thing: take it offline for the window. Audit.disablesConfig is an
OfflinePick of one-per-attempt | random-per-poll | rotating-per-poll |
highest-level | lowest-level, and five audits carry it (409, 424, 426, 502, 503).
There is no scale-a-config and no remove-a-config.

So the protection is a single insertion: drop the named config from `sorted`
inside offlinePairsFor (gate/domain/audit.model.ts) before pickOffline runs. All
five audits are covered with no per-audit special-casing, and because
liveConfigsOf is a read-time filter rather than a mutation, nothing else has to
change.

## Decisions

- Store the id on Build (build.sandboxedConfigId), NEVER on the Config.
  refreshConfig in runSnapshot.model.ts rehydrates every config from the roster
  on every action and preserves only `level`, so run-set config fields are
  silently wiped (DVTD-2cmy). Vendor lock dodges this by living on Build; Sandbox
  copies that, plus a withSandboxSurviving lens so the id cannot dangle when the
  named config leaves the build.
- Picked during `rewarding` (prep) as its own action, mirroring vendor-lock, and
  added to SHOP_WRITES.
- Cleared in closeWindow so every gate starts blank - this is a per-gate choice,
  unlike vendor lock's once-per-run commitment.
- Gate 0 enters `answering` via start(), gates 1-12 via finishReward(). A hook
  needs both seams.
- Cannot name itself.

## BLOCKER: the cost has no referent

"Other configs cannot enhance it" does not map onto this engine. Configs multiply
COVERAGE, not each other: coverageForAnswer is base x product(mults) + sum(adds),
and no config reads another config's output. The only cross-config relationships
that exist are shop-economy ones (Freemium halves draft prices, WTFPL zeroes
refunds, Garbage Collection refunds peels).

As literally written the cost is free, which makes Sandbox strictly-better audit
insurance for 0.

The one implementable reading: the sandboxed config's own `mult` leaves
buildMultiplierOf's product and pays alone, so sandboxing .js under Intellisense
costs you the x1.5 on that config's contribution. That is a real price and it
scales with how good your build is - the better the stack, the more the shelter
costs.

Do not build until this is settled. Alternatives worth weighing:
- the sandboxed config cannot be upgraded while sandboxed
- it does not count toward gate objectives
- picking one costs KB, scaling with the gate

## Why this axis

Volkswagen CI (8 slots, 384 KB) is the only audit-suppression config and it
cancels the FIRST audit by rank, whole. Sandbox is the other shape: it does not
remove an audit, it removes a target. Against 424 (one config offline all window)
that is the difference between losing your x2 and losing nothing.

## Todo

- SETTLE THE COST (blocker above)
- Build.sandboxedConfigId + withSandboxSurviving lens
- sandbox-config action + SHOP_WRITES + zod mirror
- offlinePairsFor exemption
- Clear in closeWindow; cover both start() and finishReward() seams
- Config.sandboxes axis + roster entry + CONFIG_UNLOCKS entry
- Prep UI: the picker, and the named config's marker on the build track
- Specs: each of the five offline audits skips the named config; the id
      survives a round trip through refreshConfig; it cannot name itself
- Story page, wiki 4.3 row, ADR, CHANGELOG
