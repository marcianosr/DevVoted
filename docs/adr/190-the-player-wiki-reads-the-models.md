# ADR-190: The player wiki reads the models

## Status

Accepted — 2026-10-05 (Marciano, DVTD-yco8).

## Context

`docs/wiki.md` calls itself player-facing, but it is the design reference: it
mixes planned and parked work with shipped rules, points at model files and
ADRs, and carries the reasoning behind every rule. Players had no rules
reference inside the game. Hand-typed numbers in that file drift from the
balance, which is why `scripts/wiki-sync.ts` exists.

## Decision 1: a public wiki inside the game

The wiki lives at `/wiki`, one page per article at `/wiki/$articleId`, outside
the sign-in wall: a visitor can learn the rules before making an account. The
nav carries it for everyone; on a phone it sits in the account menu, so the tab
bar stays at three (ADR-188).

## Decision 2: shipped rules only, in a player's voice

An article states what the game does today. No planned or parked work, no ADR
numbers, no file names, no reasoning. `docs/wiki.md` stays the design reference
and keeps all of that.

## Decision 3: every figure comes from a model

Article text is built from the domain constants at render time, so a balance
change reaches the wiki without anyone editing it. The projections both wikis
need (the gate ladder, config sizes, config counts and groups, the starter set)
live once in `wikiFacts.viewmodel.ts`; `wiki-sync.ts` renders them to markdown
and the in-app wiki renders them as tables.

## Decision 4: what the Dex hides, the wiki hides

The wiki explains how audits work and how many there are, but names none: an
unmet audit is locked in the Dex, and a public page would spoil it. Special
titles and unreached ranks are counted, not named, for the same reason. Configs
are listed in full, because the shop's registry already offers the whole roster.

## Decision 5: a context of its own

The wiki reads `run`, `collection` and `account` and owns no rule, so it belongs
to none of them; `ops` is about running the product, not playing it. It is the
`guide` context, aggregate `wiki`.

## Consequences

- A rename in a model breaks the wiki's build, not its truth. That is the point.
- Prose that states a rule without a figure can still go stale; it is reviewed
  like any copy when the rule changes.
- The glossary has no code source and is authored by hand.
