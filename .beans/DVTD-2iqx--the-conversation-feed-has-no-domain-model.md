---
# DVTD-2iqx
title: The conversation feed has no domain model
status: draft
type: feature
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-09-11T11:12:07Z
blocked_by:
    - DVTD-agt2
---

The kanto community screen renders a conversation feed from fixtures. There is no model behind it: grepping comment/message/post/reply/reaction/thread/chat/feed across `src/modules` and `src/database/schema.ts` returns zero hits. It is a net-new aggregate, not a recomposition.

Open questions before any code:
- Is a line authored, or emitted by the run engine? The mock reads as emitted ('Cleared Marsh on a four of five', 'Ran out of configs'), which would make it a projection over run events rather than a social feature.
- If emitted: does it need a table at all, or does it derive from `runs` + `run_states` + `poll_responses` for the day?
- If authored: moderation, rate limits, and a reporting path all arrive with it.

Needs an ADR either way. Note the run log is explicitly not a surface (`RunState.log` is never rendered), so an emitted feed needs its own announce path.
