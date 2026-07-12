---
# DVTD-uheh
title: Includes config leaks correct answers via toggle
status: completed
type: bug
priority: high
created_at: 2026-07-01T09:35:31Z
updated_at: 2026-07-01T09:41:06Z
---

When the 'includes' config is active, checking an option can reveal whether it's a correct answer via the 'you selected at least a good answer' message. If the user unchecks and tries another option, the message appears/disappears accordingly — allowing brute-forcing every correct answer before submitting. Fix: once the message has been shown (at least one correct option was selected), it should stay visible regardless of subsequent toggles.

## Summary of Changes

Added a `hasEverSelectedCorrect` latch in `PollOptions.component.tsx`. Once a correct option is selected, a `useEffect` flips this boolean to `true` and it never resets — so the positive message stays visible regardless of subsequent unchecks. The `selectedCorrectCount` derived value is still computed (still used for `showCountCorrect`) but no longer drives the `countCorrect` hint message.

## Known Remaining Vulnerability

The sessionStorage latch is a UX improvement, not a security fix. A determined user can clear sessionStorage via DevTools and brute-force again.

Root cause: `opt.correct` is sent to the client in the options payload before the user has answered. Any client-side hint derived from it is bypassable.

Real fix options:
1. Strip `correct` from the options payload for unanswered polls — hint must come from the server response post-submit.
2. Move the hint entirely to the post-answer results view — only shown after committing, not as a live toggle.

Deferred: too large in scope for now.
