---
# DVTD-v7rf
title: 'Run start screen: modern-theme port, in Storybook'
status: completed
type: task
priority: normal
created_at: 2026-08-26T06:50:55Z
updated_at: 2026-08-26T06:57:50Z
---

`RunStart.component.tsx` mixed the hooks with the screen's own copy and actions, so it could not be rendered in Storybook at all.

Split it the way `RunOver.component` / `GameOverScreen.ui` already are: `RunStartScreen.ui.tsx` takes `onStart`, `onCommunity`, `starting`, `error`; the component keeps `useRunActions` and `useNavigate`.

**Deviation from the GameOverScreen precedent:** the `Screen` wrapper and its footer actions live in the `.ui`, not the component. GameOverScreen leaves them to `RunOver`, which would have put this screen's two buttons outside the story — and their relative weight is the whole thing worth looking at. Matches the newer modern-theme screens, which all render their own `Screen`.

Story reason (CLAUDE.md): the start screen is the game's front door, and how loudly the community board sits next to "Start today's climb" is a feel decision, not layout.

- [x] `RunStartScreen.ui.tsx` + 3 stories (Fresh, Starting, StartRefused)
- [x] `RunStart.component.tsx` reduced to wiring
- [x] Spec: 5 cases
- [x] Verify: tsc, story tsc, lint, tests

## Summary of Changes

Boyscout fix while in the file: a refused start rendered in the default `Paragraph` tone, reading as more body copy under the blurb. Now `tone="cinnabar"`, matching how `RunCommunity` states its own failure. `RunOver.component.tsx` still has the untouched version of the same flaw.

The screen is still on the legacy `~/ui` kit, so the story shows the old skin — reskinning it to modern-theme is separate work.

Verification: tsc clean, no story type errors, lint + dependency-cruiser clean (766 modules), 2389 tests pass. The 3 `RewardScreen.spec.tsx` failures are pre-existing on this branch.

## Superseded within the same session (2026-08-26)

The first split put a Tier 1 at `modules/run/run/presentation/RunStartScreen.ui.tsx` on the legacy `~/ui` kit. Marciano asked for a modern-theme screen instead, and for that one deleted.

Now: `src/ui/modern-theme/screens/TodayScreen.ui.tsx`, story **Modern/Screens/Today**, spec beside it. The three legacy files are gone; `RunStart.component.tsx` renders `TodayScreen`.

**Named Today, not Start.** `Modern/Screens/Start` is already taken by the config draft at `/run/configure`. Two StartScreens in one folder is worse than reaching for the screen's own distinguishing word — its title is "Today's climb", and the game says today everywhere (today's polls, start today's climb).

No `theme` prop, matching DexScreen's reasoning: there is no gate yet, so wearing a gate's colour would claim a climb that has not started. Narrower frame than the kit's other screens (`max-w-2xl`) — they are dashboards of rows and columns, this is a heading and a sentence.

Verification: tsc clean, no story type errors, lint + dependency-cruiser clean (766 modules), 2391 tests pass (7 in the new spec). The 3 `RewardScreen.spec.tsx` failures are pre-existing on this branch.
