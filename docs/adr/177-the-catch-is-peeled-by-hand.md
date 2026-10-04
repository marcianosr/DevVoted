# ADR-177: The catch is peeled by hand

## Status

Accepted — 2026-10-02 (Marciano, DVTD-wot8). Amends
[ADR-096](096-a-config-can-promise-a-band-or-catch-one.md) Decision 2, the part
headed "It pays its own weight into the peel it just created". The arithmetic stays
the same; what changes is who presses the drop.

## Context

When Try/Catch caught a fatal close, the reducer deleted it in the same step and
took its four slots off the peel. The peel screen then showed a build without it
and a bill that was already four slots smaller. Nothing on that screen showed the
player that the catch had saved the run. It was gone before they could look at it.

## Decision 1: a caught close keeps the catch in the build

The gate holds, `caughtFatalBy` names the catch, and the catch stays in the build.
The peel owes the full quota drawn on the build that closed the gate, and never
less than the catch's own weight. Dropping the catch frees its weight the usual
way, so what is left is `max(0, quota − weight)`. That is the number ADR-096
charged, so the balance is unchanged.

The floor at the catch's weight exists because a quota below it, or a quota of
zero, would otherwise let the player retry with the catch still installed. That
would be a second catch for free.

## Decision 2: the catch is the only drop until it is dropped

While the catch is still in the build, the reducer refuses any strip that leaves it
in, any storage settlement, and any minify. The peel screen locks every other chip
and the Pay from storage press, and badges the catch "drop first". Once the catch
is picked, the rest of the peel opens up in the same press. One confirm can carry
the catch together with the other drops.

The refusal lives in the reducer, not only on the screen, because every run action
in the schema can be posted by the client.

## Decision 3: dropping the catch pays nothing and loses nothing

Dropping the catch pays no peel refund (Garbage Collection does not collect on it)
and does not count toward `configsLost`. The old self-deletion paid neither, and the
catch is a spent instance, not a config the player chose to give up.

## Consequences

- ADR-096's "its absence from the build is the record that it fired" still holds
  after the drop. Before the drop, `caughtFatalBy` is that record, and it is run
  state, so it survives hydration.
- The catch no longer appears among the gate's deleted configs. It shows up as the
  player's own drop instead.
- The peel screen gives the catch its own first section, **Drop the catch first**,
  above Pay from storage, and leaves it out of the other drops (DVTD-rdpg). The only
  press the player can make leads the panel, and it stays there, struck through, once
  it is picked.
