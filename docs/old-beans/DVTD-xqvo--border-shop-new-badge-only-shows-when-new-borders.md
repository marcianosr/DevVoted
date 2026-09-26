---
# DVTD-xqvo
title: Border Shop '(new)' badge only shows when new borders exist
status: todo
type: bug
priority: normal
created_at: 2026-06-14T12:48:19Z
updated_at: 2026-06-14T12:48:19Z
---

The "(new)" badge on the Border Shop nav item is permanent — it persists across the entire session even after the user visits the Border Shop on the profile page. Found during gameplay testing.

## Expected behavior
Show the "(new)" badge only when there are borders the user has not yet seen. Clear it once they visit the Border Shop.

## Acceptance criteria
- [ ] Badge appears only when at least one unseen border is available to the user
- [ ] Badge clears as soon as the user opens the Border Shop
- [ ] Badge does not reappear for already-seen borders in the same session or across sessions
- [ ] When the catalog gains a new border later, the badge reappears for users who haven't seen it yet

## Notes
- Likely needs a per-user "seen borders" set (timestamp or border IDs) persisted in the user profile or local storage
- Server-side is preferred for cross-device consistency
- Surfaced by gameplay tester on 2026-06-14 alongside POLLDEX/storage findings
