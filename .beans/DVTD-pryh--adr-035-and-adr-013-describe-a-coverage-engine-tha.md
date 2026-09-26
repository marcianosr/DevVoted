---
# DVTD-pryh
title: ADR-035 and ADR-013 describe a coverage engine that is gone
status: todo
type: task
priority: low
created_at: 2026-09-14T15:47:35Z
updated_at: 2026-09-14T15:47:35Z
---

Both cite a `LOSS_LADDER` that does not exist anywhere in `src`, and both describe the per-gate reset meter ADR-073 replaced.

**ADR-035 Decision 2** is wrong on four counts: the field is `window.unitsEarned` not `GateWindow.coverageGained`; there is no loss netting; the gate passes on the band ladder (OK clears, ADR-076) not the HEALTHY line; and "the run's career total never counts" is the exact reverse of the shipped model.

**ADR-013** line 9 says "both sides now score a per-gate window meter rather than a career total" and line 47 cites `LOSS_LADDER` as "the one curve since ADR-073 was built". Decision 2 (the scaled loss) is listed Live and is not implemented.

ADR-073 was corrected in DVTD-65yi; these two were left because each is a larger rewrite.

## Todo

- [ ] ADR-035 Decision 2
- [ ] ADR-013 status and Decision 2
