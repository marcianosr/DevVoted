# ADR-179: The peel names the move that pays it

## Status

Accepted — 2026-10-03 (Marciano, DVTD-s6c6). Amends the screen half of
[ADR-126](126-storage-settles-what-the-drops-cannot.md). The arithmetic is unchanged:
drops count first, storage settles what they leave, and an overpay is lost. Keeps
[ADR-177](177-the-catch-is-peeled-by-hand.md): the catch is still the first drop.

## Context

The held gate's panel showed every route at once: a bill bar, a storage checkbox, a
checkbox per config and a separate Retry press under it. The player had to add the
figures up to find out which combination opened the retry. In most holds a single
move does it, either storage or one config, so the sum is busywork.

## Decision 1: one press names the move

The panel heads with the price, **Pay 48 KB to retry**. Its one press names the move
that pays it: **Pay from storage** (stating the balance before and after), **Drop
Cache**, or **Retry gate 4** once the catch alone has settled the peel. The press is
the retry, so the screen footer has no press while the gate is held.

## Decision 2: a radio when one move pays alone

When storage covers the bill, or a config is worth at least the bill on its own, the
moves are radio rows. The rows list storage and only the configs that pay alone,
each with its value badge (and a refund badge under Garbage Collection). With both
available, **storage is picked first**, so a picked config is always a choice the
player made. Picking a config that overpays states the loss: `64 KB for 48 KB · −16 KB
lost`. With configs only, the press reads **Pick a config** and states how short
storage is.

## Decision 3: the mix is the fallback, not the default

When no single move pays alone but everything together does, the panel falls back to
ADR-126's form: config checkboxes, a storage top-up and the bill bar. When even that
cannot pay, the press reads **Nothing covers the peel** and only the way out is live.

## Decision 4: the way out sits in the same panel

**End the run** is the panel's footer, `no retry, keep 192 KB`. It no longer has a
panel of its own.

## Consequences

- The screen derives the move from the picks. Only a single-move plan rewrites them:
  a stale storage tick or a config that cannot pay alone is dropped, and the catch is
  kept. The reducer's `strip` action is unchanged.
- A catch that is still unpicked locks every row, and none of them reads as picked.
  Once the catch is picked, the bill becomes what it left owed.
