---
# DVTD-4k4d
title: 'Terminal theme: version ladder rebuilt, audits become boxed lines'
status: completed
type: task
created_at: 2026-09-01T15:50:40Z
updated_at: 2026-09-01T15:50:40Z
---

Two mock rounds: the five version rungs, and audits as boxed saffron rows shown wherever they apply.

- [x] Version ramp rebuilt off the mock: v1 bare, v2 outline, v3 outline+fill, v4 solid pallet fill with dark text, v5 the same plus an offset ring
- [x] Individual stories for every rung
- [x] Audits render as boxed rows (saffron border, faint warm fill, bold code, name, right-aligned cue)
- [x] AuditNote splits `code` from `name` so only the code is bold
- [x] Audit names never truncate; the cue wraps to its own line when it will not fit
- [x] Prep swaps its audit Row list for the boxed component
- [x] Gate hold gained audits (they were in force when you missed)
- [x] Row.wideName removed, its only caller is gone

## Summary of Changes

`Version.ui` now carries the shape in the rung itself rather than a single BOXED flag, because the top two rungs are not boxes: they are a solid `pallet` fill with knocked-out dark text, and v5 adds `outline-1 outline-offset-2` for the halo. Measured off the mock: v4/v5's fill is exactly `--color-pallet` (this project redefines pallet as a pale green, oklch(90% 0.05 150), not the Kanto white), and the border/fill alphas on v2/v3 fit pallet at 20/30% and 10%.

`Audits.ui` went from inline lines to boxed rows: `border-saffron/30 bg-saffron/5 rounded-lg px-3 py-1`, gap-2 between. `AuditNote` gained `code`, so the status number is bold and the reason phrase is not. The name is `shrink-0` (never truncates, per the last round) and the line is `flex-wrap`, so a cue that will not fit drops to a second line and stays right-aligned there. No breakpoint involved.

Audits now render on prep, poll, reveal, gate clear and gate hold. Prep dropped its Row list, which made `Row.wideName` dead, so that came out too. Story cues were shortened to the mock's voice (lowercase fragments, no full stop) and one invented audit (406 Not Acceptable) was replaced with gate 12's real trio.
