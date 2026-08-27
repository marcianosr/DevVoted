---
# DVTD-0s9s
title: 'it.skip: decline a poll, keep the streak'
status: todo
type: feature
priority: high
created_at: 2026-08-27T10:56:56Z
updated_at: 2026-08-27T10:58:17Z
blocked_by:
    - DVTD-1wjl
---

The one in-window decision. Chosen from four candidates in the 2026-08-27 brainstorm; derived from the streak rule in the sibling bean (on a single-answer poll there is exactly one true thing to assert, so the only way to assert nothing is to decline).

The hole it fills: both existing in-window verbs (lint, peek) are config-gated, KB-priced and audit-suppressible, so a build without a linter or Telemetry has zero in-window verbs. Single-answer polls have no risk-management move at all, while multi-answer polls quietly have a good one.

Behaviour:
- 0 coverage earned, 0 coverage lost, 0 KB faucet
- streak HELD (not grown, not reset), mirroring a partial
- the explanation is still shown: pillar 1, the teaching survives the loss. Declining still teaches; that is the point.
- burns one of the window's 5 polls

Pricing: structural, not KB. The gate demands a fixed coverage from 5 polls, so an abstain forces the rest of the window to carry more (at gate 5, 85% from 5 polls, skipping one leaves the last poll needing ~24% alone). The price scales with gate depth automatically, with no new tuning dial, no new resource and no config gate.

Naming: 'it.skip' is the Vitest term, so it satisfies pillar 4 (real tools, real names). Watch the collision with config status 'skipped' (ADR-040) and pick a distinct label on the pipeline rail if it reads ambiguously.

- [ ] ADR (new mechanic, cites ADR-042 pillars 1 and 4)
- [ ] Domain: a skip outcome or an unanswered-by-choice state; decide whether AnswerOutcome grows a value or the answer carries a flag
- [ ] Interaction with the Timeout audit: a timeout stays 'wrong', it does not become a skip
- [ ] PollScreen.ui: second action in the footer, with the 'keeps x1.5, scores 0' subline
- [ ] Reveal still renders the explanation on a skip
- [ ] Story + specs
- [ ] Wiki §2.5 and §4.5, CHANGELOG
