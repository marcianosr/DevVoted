---
# DVTD-78os
title: Voters not visible on result screen until page refresh
status: todo
type: bug
created_at: 2026-05-12T07:14:42Z
updated_at: 2026-05-12T07:14:42Z
---

After submitting a vote, the voter list on the result screen doesn't include the current user (or others) until the page is manually refreshed. Need to fetch voters on mount / after vote submission instead of relying on stale data.
