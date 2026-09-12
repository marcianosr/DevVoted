# ADR-006: Session-run mechanics — the config pipeline, composed gates, and failure model

## Status

Accepted (design capture, 2026-07). Depends on ADR-005.

**Live:** Decision 8 (lint is sourced, not free) and Decision 11 (coverage
scoring), as amended by ADR-013. Original numbering is kept throughout, since
code and beans cite these decisions by number.

**Dead:** the gate-as-composed-checklist model and everything built on it.
ADR-035 moved the friction onto the gate, ADR-074 owns width and killed the
storage cap, ADR-047 owns config size, ADR-048 renamed the container, ADR-055
deleted families, ADR-076 owns what a missed gate does. See the collapsed
decisions below.

## Context

ADR-005 established *where* a session run lives. It did not specify what the
player does inside one. The prototype's job was to answer that: is building a
loadout, facing escalating gates, and surviving strip-on-fail actually fun at
session speed? Multiple playthroughs said yes.

The prototype deliberately broke the `src/ui` vs `src/domains` split (it was
throwaway). Its value is the decisions below, not its code.

An earlier iteration tried multiple parallel pipelines; see
[rejected.md](rejected.md).

## Decision

### 1–2. One pipeline, and the gate is a composed checklist

Dead. The player stacked all configs onto a single container of 3 to 5 slots,
and a gate passed only if every check contributed by those configs passed.
ADR-035 deleted checks entirely: configs are pure enhancements and the gate
judges its own coverage demand plus audits. Width is not bought but billed every
gate (ADR-074), the container is **Your Build** (ADR-048), and a config's size is
a number (ADR-047).

### 3–5. Baseline escalation, reward multipliers, and config families

Dead. ADR-035 deleted checks and the escalation that raised them; ADR-055
deleted `ConfigFamily` outright, and hue now means slot size. For what each
config actually does, read the roster in [wiki §4.3](../wiki.md#43-roster).

### 6–7. Strip-on-fail, and one reward per clear

The peel survives, re-shaped: ADR-037 owns its per-gate quota, and its death
rule narrowed to a build the miss empties. The one-reward screen is dead, since
ADR-008 made the clear a multi-buy shop bounded by storage.

### 8. Lint is sourced, not free

The on-demand "cross out a wrong answer" action is available **only when a
linter config is equipped**. Owning ESLint or Stylelint grants both the passive
cross-out and the paid on-demand button. No config, no button.

*Rationale:* everything a player can *do* is earned by drafting it. An action
that exists unconditionally is a rule of the game; an action a config grants is
a reason to draft that config.

The fee escalates per use within a gate (`LINT_COSTS` in
`paidAction.model.ts`), which is the shape ADR-013 assumed when it priced
repeated linting. The original flat cost survives only in the parked prototype.

### 9–10. Rarity as a loot glow, and the storage cap

Dead. ADR-047 deleted grades in favour of a plain size; ADR-074 deleted the cap
outright, so the faucet invariant this decision set — that income never pushes
past the cap — has nothing left to clamp against. `addStorage` still behaves that
way, and is the first thing to look at when the cap comes out of the code.

### 11. Coverage scoring: the floor and the share

Rules and magnitudes live in [wiki §2.5](../wiki.md#25-coverage-scoring) and
`rules.model.ts`; ADR-013 owns the gain/loss curve. What this ADR owns is why
two of the rules have the shape they do.

- **A miss drains the poll's own category, floored at 0.** The total moves by
  what the category actually lost, so the total always equals the sum of the
  categories and you cannot lose coverage you do not hold. The floor is also
  what answers the death-spiral objection to scaling losses at all (ADR-013
  Decision 3): a growing penalty drains faster but can never push you negative.
- **Only coverage reads the multi-answer share.** Gate math, streak and storage
  stay binary on the exact-set rule, so partial credit softens the score
  without softening the pass. Every wrong pick cancels a right one, which is
  what stops shotgunning paying (`coverageShare` in `runPoll.model.ts`).

Clause 2 of the original decision, "config effects amplify gains, never
losses", was **superseded by ADR-013** on 2026-08-24: the loss is a share of
what the build earns, so config multipliers reach it by construction. That is
the only way the gain/loss lockstep can hold.

## Consequences

- The composed-gate model required the UI to always surface the full live
  checklist, because a hidden condition reads as an unfair loss. That principle
  outlived the checklist: it is why an audit names itself before the window
  (ADR-038) and why a gated press states its requirement (ADR-053).
- "Every check must pass" felt swingy, one missed condition sinking a whole
  gate, and the strip-N pressure valve was not enough. ADR-035 is the answer.
