---
# DVTD-fhmx
title: 'Kit motion: press, modal, menu and fold'
status: in-progress
type: task
priority: normal
created_at: 2026-10-19T11:03:26Z
updated_at: 2026-10-19T11:06:42Z
parent: DVTD-5qxp
---

**What:** Flat buttons shrink a little on press, dialogs fade in, the account menu grows out of its button, and folded sections slide open.

**Why:** These parts of the shared UI kit jumped or gave no feedback, while the game screens already move with care.

## Done when

- [ ] Pressing a flat button gives visible feedback
- [ ] A dialog fades in instead of cutting in
- [ ] The account menu opens from the corner under the avatar
- [ ] A folded section slides open and closed where the browser supports it
- [ ] Reduced motion keeps fades and drops movement

## Notes

Raised buttons now animate their sink (100ms). Before, transition-colors on the Button base was emitted after press-raised and silently overrode its transition, so the sink was instant.

Feel check in a real browser (Chrome, Safari, Firefox) still to do, per the plans' Verification sections.

Plans: plans/001 to plans/004 (improve-animations). Shared easing token --ease-out-strong in kanto.css @theme.
