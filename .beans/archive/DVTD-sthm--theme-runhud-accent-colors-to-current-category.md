---
# DVTD-sthm
title: Theme RunHud accent colors to current category
status: completed
type: task
priority: normal
created_at: 2026-07-15T16:29:00Z
updated_at: 2026-07-15T16:30:38Z
---

Storage KB, Gate count, and polls count in RunHud were hardcoded text-cerulean/bg-cerulean. Switched them to text-theme/bg-theme so the whole HUD strip (not just the category name) recolors to the current poll's category theme, falling back to cerulean via the :root default when no category is set.

## Follow-up: category name label removed
Removed the visible category name ("JavaScript") from RunHud per user request — the category still drives the theme color (data-category-theme on the outer div), it's just no longer spelled out as text. Updated RunHud.spec.tsx accordingly.
