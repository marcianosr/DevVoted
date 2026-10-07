# ADR-185: An approved poll pays its author once

## Status

Accepted — 2026-10-04 (Marciano, DVTD-60nr). Gives archived storage its second
source; per-answer pay (DVTD-ofah) stays open. The flat 16 KB is amended by ADR-193:
it is now the floor of a bounty that grows in a thin category.

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

## Decision 6: the payout is announced once (amended 2026-10-05)

A payout the author never sees lures no one into suggesting another poll. The author's
next visit after a first publish opens **Your poll is live**: the published question(s),
the reward as a green badge, and archived storage counting up to the balance it holds
now.

- `polls.author_announced_at` is stamped when the author closes the dialog. A paid poll
  without it raises the dialog; the migration stamps every poll already paid, so polls
  paid before this shipped stay quiet.
- The starting figure is derived, not stored: the current balance minus the reward,
  floored at zero. A snapshot taken at payout would read stale if the player spent in
  between, and the dialog would disagree with the nav.
- Several polls published since the last visit share one dialog with the summed reward.
- Admins see none, matching Decision 5. A title grant shows first; the poll dialog waits
  until it is closed.
