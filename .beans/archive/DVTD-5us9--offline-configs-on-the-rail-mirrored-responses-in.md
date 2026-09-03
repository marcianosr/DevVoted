---
# DVTD-5us9
title: Offline configs on the rail + mirrored responses in the data
status: completed
type: feature
priority: normal
created_at: 2026-08-18T10:16:22Z
updated_at: 2026-08-18T10:16:36Z
parent: DVTD-kulw
---

The two gaps ADR-038 filed, fixed.

## 1. Show when a config is not active

The pipeline rail marks an offline config (`PipelineReportRow.offline`, `RoleList.offlineConfigIds`): row dimmed, effect struck through, `offline` badge on the chip, row force-opened (a struck-out promise folded away says nothing), and its paid action removed. `liveConfigsOf` in run.model is the one place that subtracts the offline set, and `lintApplies`/`peekApplies` now read it — so the hidden button and the reducer cannot disagree.

Answering screen only: the shop and prep run before the gate, so naming the casualty there would spoil the roll. Same reason the stake receipt still prices the full build — Flaky Build and Rolling Outage move every poll, so no pre-gate number could be honest.

## 2. Mirrored answers in the data

Marciano's framing: "you deliberately choose what's wrong which isn't necessarily wrong, but also proves knowledge." So the row records **which question was asked** (`polls_responses.mirrored`), and the two readers of session answers take it opposite ways:

- **Community split excludes mirrored rows** — it sells what the room thinks the answer is, and a mirrored voter's picks invert that signal.
- **Community board counts them**, graded against the mirrored expectation — naming every wrong option proves the same knowledge, so it mixes freely with plain answers.

The line that makes those consistent: **the board counts knowledge, the split reports opinion.** Knowledge composes across mirrored and plain; opinion does not. Per-option `isRight` stays the poll's own truth.

Legacy calendar-loop stats filter `mode = 'calendar'`, so no session answer ever reached them — nothing to fix there.

## Summary of Changes

Schema: `polls_responses.mirrored boolean not null default false` + migration `20260818090000_add_mirrored_response.sql` (with a partial index on the unmirrored rows the split reads). Applied via db:push. Written by `recordSessionAnswer` off the pre-action state's live audits.

Readers: `fetchPollSplit` filters `mirrored = false` for both the count and the picks; `SessionAnswerRow`/`CommunityAnswer` carry the flag; `buildPollDetail`, the per-user correct tally, the viewer's own outcome, and `CorrectnessCheck` (third param) grade through `mirrorGrading` — a minimal `GradedPoll` mirror that shares `mirroredAnswerType` with the engine's `mirrorPoll`, since the board's ids are numeric and its options carry different fields.

UI: `PipelineReportRow.offline` (one prop; the row owns dim + strike + open), `RoleList.offlineConfigIds` + the `offline` badge, wired from the answering screen's existing `offlineConfigs`. Story `RoleList/OfflineConfig`.

Specs: 5 RoleList cases (badge, forced-open, struck effect, action removed, quiet when nothing is down), the repository's mirrored write, and 3 board cases. The board spec caught a real property while being written — poll 10 has two wrong options, so a mirrored answer naming only one is a *partial*, exactly as half a select-all would be off the mirror.

**Verification.** 1589 tests / 121 files green, oxlint + dependency-cruiser + tsc + build clean. ADR-038 Decisions 5 and 6, wiki §2.2/§4.5/§7.2, CHANGELOG folded in. Uncommitted.
