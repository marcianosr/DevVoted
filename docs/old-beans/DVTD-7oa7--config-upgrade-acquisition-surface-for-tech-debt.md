---
# DVTD-7oa7
title: Config-upgrade acquisition surface for Tech Debt
status: draft
type: feature
priority: deferred
created_at: 2026-06-14T07:37:25Z
updated_at: 2026-06-14T07:37:25Z
parent: DVTD-fapc
---

Third TD acquisition surface (post-MVP): allow upgrading config effects by accepting TD. E.g., .html-config normally gives 2% coverage per correct answer; upgrade doubles to 4% but adds a TD.

## Todos

- [ ] Decide which configs are upgradeable (all? subset?)
- [ ] Define upgrade effects (flat doubling? per-config tuning?)
- [ ] UI: upgrade affordance on config card, preview TDs that would spawn
- [ ] Run state tracks per-config upgrade level alongside active TDs
