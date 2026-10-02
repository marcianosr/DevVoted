# ADR-173: Hidden until it matters, new until met

## Status

Accepted — 2026-10-02 (Marciano, DVTD-dhl4). Amends
[ADR-116](116-a-service-is-unlocked-once-per-account.md) Decision 3 for the shop
(the Dex keeps it) and supersedes
[ADR-155](155-the-shop-reads-one-panel-at-a-time-on-a-phone.md) Decision 5's
locked fold.

## Context

Players missed what arrived mid-run: the first audit at gate 3, a config or
service unlocked during the run. Meanwhile the run screens advertised what was
not theirs yet: prep drew an Audits panel reading "Audits are unlocked at gate 3"
for gates 0-2, and the shop folded every unearned service behind
`N locked services · show`. A teaser for a later gate competes with what the
player can act on now.

## Decision 1: a run screen hides what the player cannot use yet

- Prep draws no Audits panel before the first audited gate (`AUDITS_FROM_GATE`).
- The shop lists only services the account has unlocked. A locked service has
  no row and no fold.

The Dex stays the catalogue: it still names every locked service with the line
that earns it (ADR-116 D3).

## Decision 2: "new" means first time for the account, never first time this run

A returning player is not told "new" every run. Each "new" is derived from data
already stored, so there is no seen flag:

| Thing | New when | Read from |
|---|---|---|
| An audit on prep | no gate that can hold it has been cleared yet | owned swatches, `isAuditFacedIn` |
| A config offer in the shop | it unlocked during this run | `unlockedThisRun` |
| A service in the shop | it unlocked during this run | `user_service_unlocks.unlocked_at` ≥ run start |

`isAuditFacedIn` is the same rule the audit Dex uses for `faced`, so the two
cannot disagree.

## Decision 3: one badge, one word

`NEW_BADGE` in `shared/lib/copy` is the word and colour (cerulean, as the Earned
panel's `N new` already wore). `NewBadge.ui` draws it on an audit row and a
service row; a config chip carries it in `badges`.

## Decision 4: the Dex redacts a locked service like a locked config

Amended the same day, reversing [ADR-116](116-a-service-is-unlocked-once-per-account.md)
Decision 3. A locked service reads `???` for its name and line, keeps its `?`
glyph and `unlock · <objective>`, and its panel states only `<objective> to
unlock it.` Every other Dex tab already withheld what was not earned. A service
named in full was the one exception, and the unlock line is still enough to aim
at it.

## Consequences

- A badge disappears without the player pressing anything: an audit stops being
  new once a gate holding it is cleared, and an unlock once the run ends.
- An audit dealt at gate 3 to a player who cleared gate 3 before is not new,
  even if this exact audit was never drawn. The rule counts a gate's reach, as
  the Dex does, not the draws.
