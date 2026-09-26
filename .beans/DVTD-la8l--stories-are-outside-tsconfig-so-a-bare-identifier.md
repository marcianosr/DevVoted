---
# DVTD-la8l
title: Stories are outside tsconfig, so a bare identifier crashes at runtime
status: todo
type: bug
priority: high
created_at: 2026-09-14T13:02:04Z
updated_at: 2026-09-14T13:02:04Z
---

`PollScreen.stories.tsx` referenced `REDACTED` without importing it, which threw
`ReferenceError: REDACTED is not defined` at module scope. That kills the whole
module, so EVERY PollScreen story showed Storybook's error page, not just the
one story using it.

Nothing caught it:

- `tsconfig.json` excludes `**/*.stories.tsx`, so `tsc --noEmit` never sees it
- oxlint's `react/jsx-no-undef` only covers JSX tag names; `REDACTED` was a value
  in an object literal
- no spec renders the kanto screen stories

Typechecking stories today reports 28 errors across 11 files (all prop-shape
mismatches, no further undefined identifiers). That backlog is presumably why
the exclusion exists. Clearing it and dropping the exclusion closes the hole
permanently.

## Todo

- [ ] Fix the 28 story type errors (GateRewardReport 6, old-theme/Screen 5, PrepScreen 4, AnsweringScreen 4, RunHud 3, StripScreen 3, and 3 singles)
- [ ] Drop `**/*.stories.tsx` from tsconfig exclude
- [ ] Confirm `npm run build` still passes with stories in the programme
