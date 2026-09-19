---
# DVTD-gt7e
title: Tighten the ADR set
status: completed
type: task
priority: normal
created_at: 2026-09-10T08:11:34Z
updated_at: 2026-09-10T08:27:11Z
---

65 ADRs / 5751 lines in docs/adr. The volume comes from the README convention
"decisions are immutable history" - nothing is removed, only annotated, so text
grows monotonically. docs/wiki.md already owns current rules, so an ADR only
owes the reader WHY.

Target: ~3550 lines across 50 ADRs, every line live, plus one rejected-directions
ledger.

- [x] Step 1: harvest rejected directions into docs/adr/rejected.md (BEFORE deleting)
- [x] Step 2: delete 15 superseded ADRs (016 017 018 021 022 023 025 027 030 031 033 034 041 043 045), one retired README row each
- [x] Step 3: rewrite 16 scarred survivors (006 008 009 011 013 014 015 019 026 028 035 038 044 046 050 052)
- [x] Step 4: rewrite README table (Status -> 4 values) + replace the immutability convention
- [x] Step 5: fix 5 stale code citations + 2 factually wrong wiki lines (wiki.md:505, :960 both cite superseded ADR-045)
- [x] Verify: no dangling ADR links, no orphan warning markers, lint/build/test

## Summary of Changes

62 ADRs -> 47. Words 60,326 -> 39,616 (34% cut); README 3,152 -> 1,270.

- Added docs/adr/rejected.md: 28 full entries + 11 pointers to rejections still living in a live ADR.
- Deleted 15 fully superseded ADRs (1,484 lines), each keeping a Retired row in the README.
- Rewrote 16 scarred survivors, 19,376 -> 11,447 words. Original decision numbers preserved throughout (code and beans cite them). Biggest: 044 1957->833, 026 1875->930, 006 1945->759.
- README: Status column reduced to 4 values, split into Live / Retired tables. Replaced the immutability convention that caused the growth.
- Delinked 8 dangling links to deleted ADRs across 6 surviving ADRs.
- Fixed 4 stale ADR citations in src/ (017, 023, 031, 034).

### Two real bugs found and fixed

- docs/wiki.md:505 and :960 both justified live behaviour by citing ADR-045, which ADR-046 superseded two days after acceptance. Both claimed nothing clamps the storage balance; ADR-046 D3 restored a seven-rung cap and cappedStorage clamps. Corrected.
- ADR-035 carried a COVERAGE_DEMANDS table listing gate 11 at 290 and gate 12 at 340, already retuned to 300/375 by ADR-013 on 2026-09-05. Dropped the table in favour of a pointer to rules.model.ts.

### Verification

lint clean (1 pre-existing warning in unrelated kanto-theme WIP), depcruise 909 modules no violations, build passed, 220 test files / 3861 passed / 6 skipped / 2 todo. Every ADR reference in src/ docs/ CLAUDE.md CONTEXT.md resolves to a file or a Retired row. No orphan supersession markers.

### Note

Three files now have titles that no longer match their filename (019 "Swatches are gate badges", 026 "the payoff-first gate clear", 044 keeps "spots"). Filenames deliberately unchanged: code and beans reference them.
