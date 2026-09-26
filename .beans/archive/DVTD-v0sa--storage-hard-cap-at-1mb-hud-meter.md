---
# DVTD-v0sa
title: 'Storage: hard-cap at 1MB + HUD meter'
status: completed
type: feature
priority: normal
created_at: 2026-07-15T14:50:26Z
updated_at: 2026-07-15T15:06:31Z
---

Add a visual storage meter to the run HUD (RunHud.ui.tsx) and make 1MB (1024KB) a hard gameplay cap on the storage currency in sessionRun.model.ts. Also: make Title and body text default to zinc-100.

## Summary of Changes

- `rules.model.ts`: added `STORAGE_CAP_KB = 1024` (1 MB hard cap).
- `sessionRun.model.ts`: added `addStorage(current, income)` helper clamping to the cap; applied at both income sites (gate reward + IndexedDB faucet). Income beyond 1 MB is discarded.
- `RunHud.ui.tsx`: added a compact cerulean progress meter beside the Storage stat, filling toward the 1 MB cap (with ARIA progressbar roles).
- Typography: `Title` and `Paragraph` default color changed `text-white` -> `text-zinc-100`; specs updated.
- Tests: 2 new model cap tests (gate + faucet); RunHud `StorageNearCap` story added. 32 tests pass, typecheck + lint clean.

## Follow-up (same session)

- `Popover.component.tsx`: added additive `triggerAs?: 'button' | 'span'` prop. `span` renders a focusable `role=button` wrapper (Enter/Space + hover/tap) so the popover can wrap a disabled control, where a disabled `<button>` is inert and nested buttons are invalid HTML. Default unchanged.
- `RunHud.ui.tsx`: added an ⓘ Popover next to the storage meter explaining the 1 MB cap (helps new players).
- `Screen.ui.tsx`: the `rightAction.hint` (e.g. 'Slot a config to start') now reveals on hover/tap of the disabled action button via `Popover triggerAs='span'`, instead of an always-visible `<small>` above it.
- Tests/stories: Popover span-trigger spec + `WrappingDisabledButton` story; RunHud coverage-toggle test scoped by button name. All specs pass, typecheck + lint clean.
