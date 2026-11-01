---
# DVTD-p7m5
title: The fifth poll flashes again after the day's celebration
status: completed
type: bug
priority: high
created_at: 2026-10-28T13:14:27Z
updated_at: 2026-10-31T17:47:47Z
---

**What:** After answering the fifth poll of the day, the celebration shows, and then the fifth poll shows again for a moment.

**Why:** The last screen of the day looks broken right at the moment the player feels done.

## Done when
- [x] Answering the fifth poll goes to the celebration without showing that poll again
- [x] A spec covers the step from the last answer to the celebration
- [x] The changelog states the fix

## Notes
- Reported by Marciano 2026-10-28.
- Possibly related to DVTD-25es (the hub after the last poll); the redirect after the last poll is client-side.

## Summary of Changes

2026-10-31: the fifth poll closes the gate. Next committed the reveal, sent close-gate and cleared the reveal at once, so until close-gate returned the poll screen drew the committed view, which still holds the answered poll, now without its answer. Next now keeps the reveal on screen when the gate closes; the route sync leaves for the gate result once close-gate commits. Next is ignored while an action is in flight, so a double press sends close-gate once. The unread reveal is cleared on Next, so unmounting cannot write the stale reveal over the close-gate result. Spec: RunPoll keeps the last answer of the gate on screen while the gate closes.

Not covered: a day that ends without closing the gate goes to the community board; that frame has no poll, so nothing flashes.
