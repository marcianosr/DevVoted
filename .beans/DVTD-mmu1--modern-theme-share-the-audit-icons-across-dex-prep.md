---
# DVTD-mmu1
title: 'Modern-theme: share the audit icons across Dex, prep and poll'
status: in-progress
type: task
created_at: 2026-08-23T18:34:49Z
updated_at: 2026-08-23T18:34:49Z
---

The audit glyph mapping lives as fixture data in AuditsPanel.stories. Prep shows a generic warn disc and the poll header a bare string; both should carry the audit's own icon.

- [ ] audits.ts: AuditId + AUDIT record (label + glyph), one owner
- [ ] AuditsPanel reads from it
- [ ] PrepScreen audit rows: the audit's glyph instead of Entry mark=warn
- [ ] GateHeader: audits prop composing the line from ids, so count cannot disagree with the list
- [ ] Verify: tsc, stories typecheck, lint, tests, CSS build
