---
# DVTD-ou21
title: Wiki states each rule once and matches the code
status: in-progress
type: task
priority: normal
created_at: 2026-09-29T16:53:07Z
updated_at: 2026-09-29T17:01:38Z
---

**What:** Fix the wiki's contradictions, stale audit wording, dead links and duplicated sections found in a full read.

**Why:** Where the wiki and code disagree the code wins, so every stale line misleads the next reader.

## Done when
- [x] Contradictions with code and between sections are resolved
- [x] Stale pre-ADR-138 audit wording and removed concepts are gone
- [x] Every internal link resolves and ADR citations name the right ADR
- [ ] Rules stated in several sections live in one place with pointers elsewhere

## Notes
Audit list: ~/.claude-work/plans/can-u-go-through-glimmering-donut.md. Design flags for the user: OK band now costs nothing over HEALTHY; the 10-step streak cap is unreachable since the streak resets every window.

Left open: service unlocks are still stated in both 6.2 and 6.4 Services, and 6.2 is unclear on whether kill -9's press has shipped. A parallel session was rewriting 6.1/6.2 (ADR-152 warm boot) during this pass, so those sections were not touched. Also found: a held gate never resets the streak, so it carries into the retry; the wiki now says so.
