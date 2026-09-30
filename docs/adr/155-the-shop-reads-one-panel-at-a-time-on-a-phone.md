# ADR-155: The shop reads one panel at a time on a phone

## Status

Accepted — 2026-09-29 (Marciano, DVTD-cuds).

## Context

On a phone the shop stacked Build, Registry, Incident desk and Services in one
column, so the registry, the decision you came for, sat under the whole build.
On desktop the right column carried the registry, the desk and the services
while the left held only the build.

## Decision 1: the build's side holds everything but the deal

From `md`: the left column is Build, Incident desk, Services. The right column
is the Registry alone.

Why: the right column is the deal on the table; everything you already own or
can press without an offer belongs beside the build.

## Decision 2: a phone reads one panel at a time

Below `md` a row of tabs sits under the header: Registry (offers), Build
(weight held of rented), Services (ready), Desk. It scrolls sideways rather
than wrapping and opens on Registry. Only the picked panel shows. The switch is
CSS only: every panel is in the page, the others hidden below `md`.

Why: a phone player should land on the registry, not scroll past the build.

## Decision 3: a collapsed card peeks what it does

Every collapsed config card states its description on one truncated line under
its name, in the shop, new run and the Dex alike. The peek claims no width, so
the name keeps the floor ADR-119 D6 gave it.

## Decision 4: the balance rides the footer on a phone

The header pins only from `md` (ADR-132). On a phone the shop's balance moves
from the header into the footer, beside the press, where it stays in view.

## Decision 5: services count what is ready and fold what is locked

The Services head reads `3 ready`. Locked services fold behind one row,
`3 locked services · show`.
