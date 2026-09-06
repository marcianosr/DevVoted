---
# DVTD-mihd
title: 'Prep gate window: blanks per poll, one block for poll info'
status: completed
type: task
priority: normal
created_at: 2026-09-05T20:03:34Z
updated_at: 2026-09-05T20:07:40Z
---

The prep screen's gate window reads wrong in two places (mock #47 vs #48).

- [x] Redacted `categories` draws one blank per poll (`?` x pollsPerGate), not a single `???`
- [x] `polls` and the rows that describe it (type / options / categories / next gate) lose their internal dividers so they read as one block
- [x] Wire `pollCount` from `gateStake.pollsPerGate` in PrepView
- [x] Spec + stories

## Summary of Changes

- `PrepScreen.ui.tsx`: new `Blanks` renders one `Redacted` `?` chip per poll; `Revealed` takes an optional `blanks` count and falls back to it instead of a single `???`. `window.pollCount` is the new required prop.
- The `polls` row and the rows describing it (type / options / categories / next gate) now sit in one wrapper div, so the Section's `divide-y` stops drawing borders between them — they read as one block under a single divider.
- `PrepView.component.tsx` passes `pollCount: gateStake.pollsPerGate`.
- New `PrepScreen.spec.tsx` (3 tests); the `PrepView.spec.tsx` redaction test split into a `???` count (2) and a per-poll blank count (5).

`options` still redacts to one `???` even though it is also a per-poll reading. Left alone deliberately — not asked for.
