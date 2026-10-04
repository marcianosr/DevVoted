---
# DVTD-b8y0
title: Every screen reads a server response one way
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:50:04Z
updated_at: 2026-10-01T18:51:45Z
parent: DVTD-y3vn
---

**What:** Every screen reads a server answer through the shared query and mutation readers, so none unwraps or throws on a refusal by hand.

**Why:** Two styles meant a refusal read differently on the profile, the footer and the poll form than on the run screens.

## Done when

- [x] The profile, archive, title and announcement reads use the shared query reader
- [x] Buying a border, saving a look, acknowledging titles and saving a poll use the shared mutation reader
- [x] The footer's poll count reads through the shared query reader
- [x] A refused press still shows the same text and no longer runs its follow-up step

## Notes

Holdouts were `useArchiveState`, `usePurchaseBorder`, `useTitleState`, `usePublicProfile`, `useSaveLook`/`useLookDraft`, `useTitleAnnouncement`/`useAcknowledgeTitles`, `Footer.component`, `usePollAuthoring`. `useRunActions`' `dispatch` stays on plain `useMutation`: it never throws and hands the raw result to `useRunCommit` callers.

`useMutation`'s `onSuccess` fires on a handled refusal now (the response is a value, not a throw), so every `onSuccess` — hook-level and per-`mutate` — guards on `result.success`. The announcement cache write is now an `ApiResponse` envelope since the cache holds the response.

## Summary of Changes

- Profile hooks return `useApiQuery`'s `{ view, isPending, errorMessage }`; consumers read `view` (null, not undefined, when absent). No consumer read `isLoading`, so no `useApiQuery` extension was needed.
- Mutations moved to `useApiMutation`; error text reads `errorMessage`.
- `Footer` reads `view` directly; `view` is null while loading, which matches the old `!isLoading && success` check.
