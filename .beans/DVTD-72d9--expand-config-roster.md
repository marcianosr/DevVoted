---
# DVTD-72d9
title: Expand config roster
status: in-progress
type: feature
priority: normal
created_at: 2026-07-24T15:25:42Z
updated_at: 2026-07-27T14:16:47Z
parent: DVTD-d0fw
---

Grow the run config roster. Phase 1: focus configs for every category lacking one (python, general-frontend, general-backend). Later phases (parked in chat): rm -rf (strip-all + 2x refund), localStorage (storage burst), storage extender (raise 1MB cap, sticky/non-removable risk).

## Phase 1 — done
Added focus configs `py` (.py → python), `frontend` (.fe → general-frontend), `backend` (.be → general-backend) to configRoster.model.ts. Every category now has a focus config. Auto-surfaces in draft/shop (rollDraft), no allowlist change. tsc clean, 46 config/draft/pipeline tests pass. Changelog updated.

Parked in chat for later phases: rm -rf, localStorage, storage extender.
