# ADR-185: An approved poll pays its author once

## Status

Accepted — 2026-10-04 (Marciano, DVTD-60nr). Gives archived storage its second
source; per-answer pay (DVTD-ofah) stays open.

## Context

Players can suggest a poll, which lands as a draft. An admin approves it by saving it
as published. That paid the author nothing, so nothing in the game asked a player to
write one. Archived storage is the account's one persistent wallet and was credited
only at run end.

## Decision 1: the first publish pays a flat 16 KB

The first time a poll is saved as published, its author banks 16 KB of archived
storage. The figure is `APPROVED_POLL_ARCHIVE_KB`. It is a token sum on purpose: a
quarter of the Extend carry, so writing polls tops the wallet up without competing
with a run.

## Decision 2: a stamp on the poll makes it once

Status can flip draft → published → draft → published, so paying on every publish is
a faucet. `polls.author_paid_at` is stamped by a guarded update (published, not yet
stamped) inside the save's transaction, and only a row that update returns is paid.
No read-then-write, so two saves racing pay once.

## Decision 3: not retroactive

Polls already published when this shipped are stamped without a payout, in line with
ADR-051's no-backfill rule. Republishing one of them pays nothing.

## Decision 4: the reward is stated where a player suggests

The nav's suggest link reads **Suggest a poll · +16 KB**, and *Your suggested polls*
states what a published poll banks. ~~Admin-authored polls pay too: excluding them is a
rule with no player it protects.~~ Superseded by Decision 5.

## Decision 5: an admin's own poll pays nothing (amended 2026-10-04)

Marciano disagreed with the last line of Decision 4. The admin writes and publishes most
of the polls (414 at the time), so paying them turns the reward into a private faucet
the admin cannot help opening, and the **+16 KB** in the nav advertises a payout to the
one account that would never act on it.

- The first publish of an admin's poll is still stamped, so it can never pay later; the
  archive credit skips an author whose email is an admin address.
- The admin's nav states **Suggest a poll** with no reward. *Your suggested polls*
  already hid the reward line from admins.
- Everyone else sees the reward as a green badge beside **Suggest a poll**.
