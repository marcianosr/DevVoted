# ADR-015: Storage-cap policy — one-shot grants clip at the cap

## Status

Accepted 2026-07-25. Amends [ADR-006](006-session-run-mechanics.md) Decision 10.

**Live:** Decisions 1 and 2. **Dead:** Decision 3 (the cap-extender config) and
Decision 4 (no selling) — both reversed, and both in
[rejected.md](rejected.md). [ADR-046](046-slots-are-bought-storage-is-capped-again.md)
owns the cap.

## Context

Config unlocking introduced candidates whose effects touch the storage economy
directly, and two mechanic holes surfaced before implementation. A **one-shot
grant** config fires once and then does nothing: is it a config at all, and what
happens when the grant lands near the cap? And what happens to storage above the
cap when whatever was holding it up goes away?

## Decision

### 1. One-shot grant configs are ordinary configs, embraced as strip fodder

No consumable or item class. A grant config pays its value up front and then
dead-weights a slot, which makes it the natural peel on a failed gate, since its
value is already extracted: a **pre-paid strip shield**. That emergent role is
the design, not a flaw.

A separate slot-free item class (Balatro's tarots vs jokers) is rejected until
multiple one-shot effects exist to justify it.

### 2. Grants clip at the cap, and the shop shows the clip before purchase

ADR-006's invariant stands: income never pushes past the cap. A grant that would
overflow is clipped, and the shop displays the clipped value up front
(`+128KB → +74KB (capped)`).

*Rationale:* a purchase that is situationally bad is healthy roguelike design; a
purchase that **hides** its waste is not. This is the same rule as ADR-053's
`upgradePreview` and ADR-046's plan rows naming their bill: the press states
what it actually buys.

### 3–4. Cap-extenders, and the absence of selling

Both dead. The extender was moved out of the config roster within two weeks (a
config that raises a limit would be in every build), and the cap is now a rented
plan. Selling landed with the config action popover and refunds half the draft
cost.

The over-cap rule the extender needed — excess persists, gains freeze, never
confiscate — is worth remembering as the shape that made a cap shrink survivable:
`addStorage` clamps rather than deletes, so no credit can pass the cap and no
cap change can strand a player with nothing.

## Consequences

- Strip choice gained texture: peeling a spent grant costs nothing, which is
  exactly why it is the config a player reaches for first.
- Grant-config pricing needs care. Priced too far under the grant, it becomes
  free money **plus** a strip shield.
