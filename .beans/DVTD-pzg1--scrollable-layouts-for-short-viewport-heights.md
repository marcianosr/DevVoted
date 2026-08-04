---
# DVTD-pzg1
title: Scrollable layouts for short viewport heights
status: completed
type: feature
priority: high
created_at: 2026-07-20T15:16:25Z
updated_at: 2026-08-04T16:14:13Z
parent: DVTD-cb52
---

Players on shorter screens (mobile portrait, small desktop windows) can't see all content: pipelines cut off in run hub, questions cut off in quiz flow. Need scrollable container strategy.

## Affected Areas

- **Run Hub**: Pipeline list not fully visible when screen height < ~600px
- **Quiz Flow**: Question text, options, or action buttons cut off or squeezed
- **Mobile Portrait**: Particularly bad on phones in portrait orientation

## Design Considerations

- Which sections should scroll independently vs. lock (e.g., keep nav fixed)?
- Min-height requirements for quiz question readability?
- Mobile-first: portrait vs. landscape height constraints
- Ensure scrollbar doesn't cause layout shift

## Related

- Multiple choice handling (DVTD-wrem)
- Ad story shared fonts for visual refresh
