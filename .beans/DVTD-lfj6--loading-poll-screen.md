---
# DVTD-lfj6
title: The poll screen has no loading state
status: todo
type: feature
priority: normal
created_at: 2026-07-21T20:18:54Z
updated_at: 2026-09-24T12:49:07Z
parent: DVTD-cb52
---

**What:** A loading state for the poll screen while a poll is being fetched.

**Why:** The screen shows nothing at all while it waits.

## Done when
- [ ] The poll screen shows a skeleton in the shape of the real screen while loading
- [ ] It matches the rest of the game's style
- [ ] A story covers the loading state

## Notes

Create a loading state UI for when a poll is being fetched or prepared for display

## Loading States to Handle

- Initial poll fetch loading (skeleton or spinner)
- Poll options loading/rendering
- Category badge loading
- Question/markdown rendering state
- Coverage information loading state

## Design Considerations

- Match the visual style of existing screens
- Use appropriate animation/skeleton pattern
- Show what content is being loaded (progressive reveal)
- Keep load states brief and smooth
- Consider using Tailwind skeleton classes or custom shimmer effect
