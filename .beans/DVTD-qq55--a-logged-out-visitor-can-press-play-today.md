---
# DVTD-qq55
title: A logged-out visitor can press Play today
status: todo
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-20T14:44:07Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** The logged-out home offers a button that starts a guest session and opens the run.

**Why:** Visitors from a shared result leave at the login screen.

## Done when
- [ ] Pressing Play today starts a run without an account
- [ ] Member-only screens offer sign-in in place
- [ ] The logged-out home shows a pairs poll as an example, playable only after Play today

## Notes
- Slice 3 of DVTD-nr8f. Browser signInAnonymously, clear queryClient, navigate to /run. Landing page itself is DVTD-erjz #11.

- Decided 2026-10-20: the home page shows a pairs poll as a non-interactive preview. Playing it needs a guest session, so the preview leads into Play today.

- 2026-10-20: a bare Play today without an account press sits under the sign-in on the logged-out home, pulled forward for local testing before slice 2. The pairs preview and the member-only screens are still open.
