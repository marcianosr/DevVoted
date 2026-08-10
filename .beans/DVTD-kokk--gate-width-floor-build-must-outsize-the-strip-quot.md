---
# DVTD-kokk
title: 'Gate width floor: build must outsize the strip quota'
status: in-progress
type: feature
created_at: 2026-08-10T15:08:34Z
updated_at: 2026-08-10T15:08:34Z
---

A gate demands a build of at least dropCount(gate)+1 configs — the smallest width that can survive its own stake. Kills the 1-config cheese (checks come only from configs, so thinness shrank the checklist; demonstrated live at Soul gate 2026-08-10). Floor enforced at gate entry + shop guard generalizes holdsLastConfig; replays after a strip exempt (ADR-021 owns that spiral). Also kills drop-during-answering (mid-window check-shedding). Amends ADR-017 §3 (bareness rule scales from ≥1 to ≥floor), ADR-021 §3, touches ADR-019 wording.

- [ ] minConfigsForGate in rules.model + spec
- [ ] Entry enforcement in run.model (finish-reward blocked while solvent; entering insolvent-under-floor = death at the gate) + spec
- [ ] start blocked under floor at gate 0 + spec
- [ ] Shop guard: sell/deinstall refused below next gate's floor + spec
- [ ] Kill drop during answering + spec
- [ ] Demand row on prep/stake surfaces + shop warning
- [ ] ADR-027
- [ ] CHANGELOG + wiki check
