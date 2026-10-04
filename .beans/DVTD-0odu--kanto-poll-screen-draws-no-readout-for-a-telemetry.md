---
# DVTD-0odu
title: Kanto poll screen draws no readout for a Telemetry peek
status: todo
type: bug
priority: normal
created_at: 2026-09-13T09:52:22Z
updated_at: 2026-09-13T09:52:22Z
---

Telemetry's press is now wired on the kanto poll screen (DVTD-gzbc) and `peek-poll` dispatches, but nothing renders the result. `RunView.currentPollPeeked` is consumed 0 times in src/ui and in every kanto presentation/ adapter, and the split itself is fetched separately by `usePollSplit` -> pollSplit.service.ts, which /proto-run never calls.

So the player can pay the fee and see nothing change except the badge going to 'already read'. The old-theme /run/answer screen passed `splitByOptionId` into PollCard; kanto has no equivalent.

Story `Kanto/Configs/Telemetry` shows the press and the post-press refusal, and deliberately stops there.
