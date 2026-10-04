---
# DVTD-449q
title: npm audit names an outage's target at prep
status: completed
type: feature
priority: normal
created_at: 2026-09-30T08:53:55Z
updated_at: 2026-09-30T09:20:37Z
parent: DVTD-72d9
---

**What:** A 2-weight config that, at prep, names the installed config each scheduled outage audit will take offline.

**Why:** Prep names the audit and leaves the victim to the gate, so a build had no way to plan around an outage it could see coming.

## Done when
- [x] With npm audit installed, prep names the config each outage audit hits, per poll where the pick moves
- [x] Without it, prep reads as before
- [x] The named target matches what the poll screen takes offline
- [x] It unlocks after 3 audited gates cleared

## Notes

Design settled 2026-09-29 (ADR-158). The config-gated exception to ADR-038 D5. The reveal is computed server-side from the same seeded pick the gate uses, over the installed build.

## Summary of Changes

New config `npm-audit` (weight 2, `revealsOutageTargets`, answerHelp group, skipped on the poll screen as works in prep, unlock audited-gates-cleared 3). `outageTargetsFor` in the audit model reuses `pickOffline` once per poll position; `outageTargetsOf` on RunState; `RunView.outageTargets` is null unless the build holds npm audit (installed, not live). Prep's audit rows gain a target line from `outageTargetLineFor`: one name when every poll agrees, play order when they differ, the whole build on poll 1 for 425. `AuditsRow.target` renders as a hint under the audit. Stories `NpmAudit.stories.tsx`. ADR-158 D4 with a pointer in ADR-038 D5.
