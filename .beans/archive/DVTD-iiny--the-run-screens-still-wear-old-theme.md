---
# DVTD-iiny
title: The /run screens still wear old-theme
status: completed
type: task
priority: critical
created_at: 2026-09-15T14:14:03Z
updated_at: 2026-09-16T10:54:24Z
parent: DVTD-0x5c
---

`/run/*` renders old-theme screens; proto-run renders the kanto `*View.component` set off the same `RunView`. Each swap is dropping `useTodaysRun().view` and `useRunActions().send` into a component that already takes `(view, ...callbacks)`.

`RunPrep` is the worked example: it already renders the kanto `PrepView`.

- [x] `RunConfigure` to `StartView`
- [x] `RunAnswer` to `PollView` (keep `sendWith`/`commit` for the reveal, do not port proto-run's `pinned`)
- [x] `RunReward` to `GateOutcomeView` (verdict `cleared`)
- [x] `RunStrip` to `GateOutcomeView` (verdict `held`), needs DVTD-3hcg
- [x] `RunShop` to `ShopView`
- [x] `RunOver` to `RunOverView`
- [x] Expose `users.archived_storage` on `RunView` so `RunOverView.archiveAfterKb` is filled
- [x] Delete the proto-run dev rig, or gate it behind the route's PROD redirect

## Summary of Changes

All seven route components now render the kanto adapters off `useTodaysRun().view` and `useRunActions()`. `RunConfigure` became `RunNew` (StartView), `RunAnswer` became `RunPoll` (PollView), `RunReward` and `RunStrip` collapsed into one `RunGate` (GateOutcomeView, verdict from status), `RunShop` renders ShopView, `RunOver` renders RunOverView, and `RunReview` renders ReviewView (it was missing from this list but wore old-theme too).

`RunLayout` lost the HUD entirely: every kanto screen carries its own header, coverage bar and build footer, so a layout bar would state the same numbers twice.

The reveal does not port `pinned`. `RunPoll` feeds PollView the **staged** result (`reveal.data`) as its view and the staged `answeredThisGate.at(-1)` as `answered`, so the answered mood has one source and no second flag.

`RunView.archiveAfterKb` is filled by the service from `users.archived_storage` (bytes, divided), not by `toRunView` — the archive is account state, not run state.

proto-run is KEPT: it is already PROD-redirected and its dev rig is the only way to reach a late gate without answering 65 polls.

Sweep: 81 files deleted (31 components orphaned by the swap plus their specs and stories). Verified unreachable from every route by a transitive import walk, and `src/modules/run/config/presentation/` is gone entirely.

Known gaps filed as DVTD-4kte: the kanto poll screen has no slot for abandon, the peek split, or the clock.
