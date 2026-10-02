---
# DVTD-ozcv
title: Earned titles open the legacy thank-you modal
status: in-progress
type: bug
priority: normal
created_at: 2026-10-02T09:50:25Z
updated_at: 2026-10-02T09:52:31Z
---

**What:** A title earned in a run opens the legacy "Thank you for playing" modal on top of the debrief.

**Why:** That modal speaks only to players from before the rebuild, and the debrief's Earned panel already announces the title.

## Done when
- [ ] Clearing a gate that earns a title opens no modal; the Earned panel lists the title
- [ ] A legacy player still gets the thank-you modal for a granted title
- [x] Titles already earned but never shown stop opening the modal

## Notes
ADR-111 D5 announced earned and granted titles through one modal. ADR-154 then granted titles at every close and gave them the Earned panel. Fix: the announcement service filters to granted titles, and earned titles are stamped announced when they are granted.
