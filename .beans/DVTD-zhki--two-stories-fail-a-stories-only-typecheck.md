---
# DVTD-zhki
title: Two stories fail a stories-only typecheck
status: todo
type: bug
priority: low
created_at: 2026-08-13T15:13:24Z
updated_at: 2026-08-13T15:13:24Z
parent: DVTD-82c4
---

Found while verifying **DVTD-xg62**. `tsconfig.json` excludes `*.stories.tsx`, so `npm run build` never typechecks them and these stay invisible.

Checked by pointing a temp tsconfig at the same settings with `exclude: []`:

- `community/presentation/RunCommunity.stories.tsx:55,150,190,251` — `'standouts' does not exist in type 'Partial<RunCommunityBoardProps>'`
- `gate/presentation/RoleList.stories.tsx:101` — `'claim' does not exist in type 'NextSlotArgs & { justUnlocked?: readonly number[] }'`

Both are props that were renamed or removed without the story following. The stories still render, because the extra key is ignored at runtime — which is exactly why nothing caught it.

Related: the exclusion is also the cause of the phantom `~/` module-not-found errors the editor shows in story files.

## Todo

- [ ] Fix both stories against the current prop types
- [ ] Decide whether stories should be typechecked in CI — a `tsconfig.stories.json` in the lint script would stop the next silent drift
