---
# DVTD-civm
title: Make Correct fully config-driven (rework death mechanic)
status: draft
type: feature
priority: normal
created_at: 2026-07-12T19:54:36Z
updated_at: 2026-07-12T19:54:36Z
parent: DVTD-5jpw
---

Now: Unit Tests config carries the 'Correct' requirement and is selectable; the 'Correct' check shows its chip when equipped. But the always-on baseline is KEPT because removing it breaks death — a bare pipeline would have no requirements, always pass, and never trigger game-over (closeWindow's dead path needs a failed gate). To fully honor 'Correct should not be default / no configs = no requirements', death needs reworking (e.g. die on running out of polls/storage, or force a correct-config, or a hidden floor). Decide the death model, then drop the baseline in checkStatuses/gate.model.
