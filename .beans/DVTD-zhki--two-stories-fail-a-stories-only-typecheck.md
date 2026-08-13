---
# DVTD-zhki
title: Two stories fail a stories-only typecheck
status: todo
type: bug
priority: low
created_at: 2026-08-13T15:13:24Z
updated_at: 2026-08-13T15:47:57Z
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

## Two more found (2026-08-13, during DVTD-od1l)

Same cause, same invisibility:

- `run/presentation/RunHud.stories.tsx:17,31,45,60` — `'storageBillKb' does not exist in type 'Partial<RunHudProps>'`. The HUD stopped taking the storage bill (it reads the cap from props now), and the story kept passing it.
- `ui/typography/Title.stories.tsx:27` — `'category' does not exist in type 'Partial<TitleProps>'`. A leftover from the per-category palette that ADR-020 retired.

Four story files now, not two: **RunCommunity, RoleList, RunHud, Title**. Every one is a prop that was renamed or removed while the story kept the old key — which is exactly the drift a typecheck would have caught on the day.

That strengthens the second todo: the value here is less in fixing four files than in making the fifth impossible.
