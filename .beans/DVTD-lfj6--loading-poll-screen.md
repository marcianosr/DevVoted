---
# DVTD-lfj6
title: Loading poll screen
status: todo
type: feature
priority: normal
created_at: 2026-07-21T20:18:54Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-cb52
---

Create a loading state UI for when a poll is being fetched or prepared for display

## Loading States to Handle

- [ ] Initial poll fetch loading (skeleton or spinner)
- [ ] Poll options loading/rendering
- [ ] Category badge loading
- [ ] Question/markdown rendering state
- [ ] Coverage information loading state

## Design Considerations

- Match the visual style of existing screens
- Use appropriate animation/skeleton pattern
- Show what content is being loaded (progressive reveal)
- Keep load states brief and smooth
- Consider using Tailwind skeleton classes or custom shimmer effect
