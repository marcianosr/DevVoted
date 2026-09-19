---
# DVTD-3rok
title: Rename kanto Byline to Author and strip all comments from the kit
status: completed
type: task
priority: normal
created_at: 2026-09-09T08:28:55Z
updated_at: 2026-09-09T08:34:01Z
---

Byline is the wrong name for the component: it credits a poll's author, and 'byline' names the layout slot rather than the thing. Rename to Author across ui/spec/stories. Separately, src/ui/kanto-theme carries explanatory comments in every file; house rule is zero comments in new code, so strip them all.

- [x] Rename Byline.{ui,spec,stories}.tsx to Author.*
- [x] Rename identifiers: Byline/BylineProps/BYLINE, Storybook title
- [x] Strip every comment from src/ui/kanto-theme
- [x] lint + typecheck (app + stories) + tests

## Summary of Changes

- `Byline.{ui,spec,stories}.tsx` to `Author.*`; `Byline`/`BylineProps`/`BYLINE` to `Author`/`AuthorProps`/`AUTHOR`; Storybook title `Kanto/Byline` to `Kanto/Author`. `githubAvatarUrl` kept its name. `src/ui/terminal-theme/Byline.ui.tsx` is a separate component and was left alone.
- Dropped an unused `Typography` import in the stories file, which the app build never typechecks (stories are excluded from tsconfig) and oxlint did not flag.
- Stripped every comment from all 22 `.ts(x)` files in `src/ui/kanto-theme` (128 lines): line comments plus one JSDoc block, with blank-line runs collapsed.
- Ran `prettier --write` over the folder. Nine files were already failing `format:check` before this change, since hand-written JSX overran the 80-column limit.

Verified: `npm run lint` clean (858 modules), `tsc --noEmit` clean, no kanto story type errors, `npm test` 204 files / 3542 passed / 6 skipped / 2 todo.

Open: the kit now has no in-repo explanation for its load-bearing invariants (seal-bar width derived from the letter, audit setting its own theme, undiscovered swatch withholding its attribute). Test names carry most of it; an ADR for the kanto kit would carry the rest.
