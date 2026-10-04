---
# DVTD-w749
title: Rewrite the open DevVoted 2.0 beans into a short plain-language shape
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:04Z
updated_at: 2026-09-24T12:51:09Z
---

**What** Every open bean under DevVoted 2.0 opens with what/why plus acceptance criteria, with the old detail kept below.
**Why** The beans had grown into design documents; picking one up meant reading a page before knowing what it asked for.

## Done when
- [x] All 123 open 2.0 beans carry the what/why + Done when shape
- [x] No original body content is lost (each one keeps its detail under Notes)
- [x] Beans whose premise looks superseded carry a check-before-starting flag
- [x] Status, type, priority and parent are unchanged on every bean

## Summary of Changes

123 open beans under DevVoted 2.0 (95 todo, 26 draft, 2 in-progress) rewritten to open with a what/why pair and a Done when checklist, with every word of the old body kept verbatim under Notes. 90 titles simplified; filenames unaffected. 24 beans carry a check-before-starting flag where the premise looks superseded. Median short read is 443 characters against a median old body of 1,398. Verified: no content lost on any bean, no status/type/priority/parent changed on any of the 774, 121 files touched plus 2 that were uncommitted already, nothing outside .beans/ modified.

Exception, stated on purpose: five epics whose entire body was a single line describing the epic (82c4, cb52, d0fw, h175, z2r2) lost that line, because the what/why restates it. Every other bean keeps everything.

## Follow-up 2026-09-24

The first pass put `**What:**` and `**Why:**` on consecutive lines, which markdown renders as one run-on paragraph (visible in `beans show`). Re-applied all 123 with a blank line between them and a colon after each label, so the two lines survive a renderer that strips bold. The shape is now recorded as [ADR-107](docs/adr/107-a-bean-states-what-and-why-first.md), with a pointer in CLAUDE.md so it is loaded every session.
