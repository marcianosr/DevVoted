---
# DVTD-ofah
title: A poll you wrote pays 1 KB of Archive per answer
status: todo
type: feature
priority: normal
created_at: 2026-09-05T08:45:44Z
updated_at: 2026-09-05T08:45:44Z
parent: DVTD-z2r2
---

A poll you wrote pays its author 1 KB of Archive for every distinct player who answers it, so writing polls feeds the account the same currency runs do.

## What already exists

- **Authorship is recorded.** `polls.created_by` is a non-null FK to `users`, kept through user deletion on purpose ("preserves poll history").
- **The Archive is a real balance.** `users.archived_storage`, bytes, bigint. Credited today only at run end from unused in-run storage, and spent on start slots (ADR-049, tracked per run as `injected_archive_bytes`) and the git tag (ADR-036).
- **A submission counter already exists**: `users.total_polls_submitted`, read in exactly one place, the admin page's submitter leaderboard.

## The prerequisite this story cannot skip

**There is no community submission flow.** Poll creation lives on `/_authed/admin`, behind `ADMIN_EMAILS`. So "stimulate poll creations of community" needs a submit form, a moderation state (the `polls.status` enum already has `draft` / `published` / `archived`, which is the right seam), and a rejection path, before a per-answer payout has anything to pay out on. Either this story grows to include that, or it depends on a bean that does. My read: split it, and let this one own the economics.

## Payout rules to settle

1. **Per user, not per answer.** Re-answering exists as a mechanic (DVTD-1d4w), so the credit must key on distinct `(poll, answering user)` or the same player farms an author by re-answering. The per-answer rows from DVTD-qmc5 are the natural place to derive that.
2. **Self-answers pay nothing.** Otherwise the loop is a faucet with one participant.
3. **Published only.** A poll pays from the moment it is published, which makes moderation the gate on the whole economy and keeps spam unpaid.
4. **Cap or no cap.** 1 KB is small next to the prices it buys: a config costs 32 KB a slot, and a start slot is `nextSlotPriceKb` at a ×2 premium. So a rarely-served poll is a slow drip, while a poll picked for a busy day could pay hundreds of KB in a week. That spread is arguably correct (it pays polls good enough to be picked) but it is the number to sanity-check before shipping, not after.
5. **Retroactive or not.** ADR-051 line 137 says no grandfathering and no historical backfill because the game is pre-release. Existing polls have authors, so either that line holds and the counter starts at zero, or storage is deliberately the exception. DVTD-yqy4 already flags this same contradiction for the existing balances; answer both at once.
6. **The author has to see it.** DVTD-yqy4's own point: a balance the player cannot watch accrue is not a reward. Needs a line somewhere ("Your poll on Vue was answered 14 times: +14 KB"), which is also the thing that actually drives more submissions.

## Design risk worth naming

Paying per answer rewards *reach*, not *quality*. The cheapest way to be answered often is to write easy, short, popular-category polls. If the daily selection weights toward what gets answered, that is a feedback loop toward blandness. Two cheap counterweights: pay only on polls that pass moderation (already assumed), and consider whether the payout should key on something the author cannot game, e.g. paying nothing for a poll everyone gets right. Worth a decision, not necessarily a mechanic.

## Todo

- [ ] Decide the split: does this bean include the submission and moderation flow, or depend on it
- [ ] Settle rules 1 to 6
- [ ] Credit seam on answer recording, deduped per distinct answerer, self-answers excluded
- [ ] Migration for whatever ledger the credit needs, guarded per ADR-012
- [ ] Author-facing surface so the accrual is visible
- [ ] Wiki: the Archive gains a second source, so §5 needs the sentence
