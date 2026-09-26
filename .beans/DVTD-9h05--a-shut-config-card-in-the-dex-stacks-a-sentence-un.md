---
# DVTD-9h05
title: A shut config card in the dex stacks a sentence under its name
status: completed
type: bug
priority: normal
created_at: 2026-09-26T16:58:52Z
updated_at: 2026-09-26T17:06:35Z
---

**What:** Give an earned config's provenance to the card body, so a shut card in the dex is one row like every other.

**Why:** A sentence in the head makes one card three lines tall beside neighbours that are one, and the grid row it sits in tears open.

## Done when

- [x] A shut card in the dex states only its name and its badge
- [x] How a config was earned reads in the card body, beside its effect
- [x] The starter and earned words are not said twice on one card
- [x] The weight groups read as even rows

## Notes

Reported from a screenshot of the configs tab. The head keeps a short mark, which
is what the shop's roll odds use it for; prose belongs in the body.

## Summary of Changes

ADR-123 decision 2. The head keeps a short mark; prose is body copy.

The card put an earned config's provenance in `detail`, which renders in the head inside the one column that can grow, so a shut card ran three lines where its neighbours ran one and the flow grid tore its row open. `detail` is gone from the dex card. The note under the effect now states the provenance sentence the domain already produces plus the ladder tail: `Starter config · v1 of 5`, `Earned: peeked the community split 5 times · v1 of 2`.

The `starter` / `earned` tags went with it. They were saying a second time what the sentence said, and because a starter's provenance already reads `Starter config`, the whole `entry.starter` branch dropped out of the card builder.

The story fixture mirrors the builder by hand rather than calling it, since it builds from literals and not configs. Both moved together; the mirror stays as a drift source.

Verification: 4062 tests across 208 files, typecheck, oxlint, dependency-cruiser and docs:check green.

## Docs

The wiki's dex configs prose still described the deleted `i` and its two-line hint from before ADR-120. Rewritten to the card as it stands.
