# ADR-030: The storage-plan ladder is gate-staged, and climbs to 3MB

## Status

Accepted (2026-08-11, Marciano). **Amends [ADR-023](023-storage-capacity-is-a-subscription.md)
Decision 1** — the subscription mechanic itself (bill on every closed window,
insolvency auto-downgrade, shop-only switching, the engines-vs-infra split) is
unchanged. Numbers stay live-tuned in `rules.model.ts` (`STORAGE_PLANS`).

## Context

ADR-023 shipped three rungs: 512KB free, 640KB at 8KB/gate, 768KB at 16KB/gate.
All three were on sale in the very first shop. Marciano asked for the ladder to
reach 3MB, and asked whether the new rungs should be gated.

They should, and the reason is economic rather than pedagogical. A clear pays
roughly `GATE_REWARD_KB × gate` (32KB × gate, correctness-scaled), and the bill
collects on every closed window pass or fail. So a cap only earns its bill once
income can plausibly fill it. Sold at gate 0, a 3MB cap is not an interesting
gamble — it is a recurring charge against storage the run cannot yet earn, and
the insolvency rule (ADR-023 Decision 3) would collect the punishment for taking
it. That is a trap, not a decision.

Staging also happens to answer a second problem: seven rungs on sale at once
turns a three-row shop section into a wall.

## Decision

1. **Seven rungs, to a 3MB cap**: 512KB free, 640KB/8, 768KB/16, 1MB/32,
   1.5MB/48, 2MB/72, 3MB/112 (all bills per closed window).
2. **Each rung carries a `fromGate`** and is not sold before it:
   0, 0, 2, 4, 6, 8, 10. The free tier and the first paid rung are available from
   the opening shop, so the mechanic is still taught immediately.
3. **A rung's bill runs roughly a fifth to a third of a perfect clear at the gate
   that opens it.** That ratio is the tuning rule, not the individual numbers —
   `rules.model.spec.ts` asserts the ceiling rather than the exact prices, so the
   ladder can be retuned without rewriting the test.
4. **The reducer enforces the staging, not the shop's rendering.** The wire
   carries a bare tier number (anti-cheat: intent only, DVTD-ay5e), so
   `changePlan` refuses a rung whose `fromGate` the run has not reached.
5. **The shop draws the unlocked rungs plus exactly one locked rung**, greyed,
   naming the gate that opens it ("Opens after gate 4"). One, not the whole tail:
   the ladder should read as going somewhere without listing six things the run
   cannot buy. Same pattern as the slot-unlock rung (ADR-025 Decision 2).
6. **Rows read `512KB · Free` / `640KB · 8KB / gate`** (Marciano's format), with
   caps above 1023KB written in MB (`formatKb`, `src/lib/storage.ts`). "Free" is a
   price in the same column as the others, not an aside about the tier.

Rejected: unlocking rungs with *storage earned* rather than gate depth. It reads
as the same axis twice (you buy capacity by having had capacity) and it would let
a lucky faucet run buy a bill it then cannot service.

## Consequences

- **The insolvency cliff scales with the rung.** An unpayable bill drops the run
  to the free tier (ADR-023 Decision 3) and the clamp lands at *Climb on*, so
  going insolvent while sitting on 2.5MB burns about 2MB. Deep rungs are meant to
  be a real gamble; this is the sharp edge of it and the first thing to watch in
  playtest.
- Runs snapshotted before this ADR carry a tier from the old three-rung ladder.
  Tiers 1–3 kept their caps and bills, so those runs are unaffected.
- The gate-staged unlocks now come from two files (`STORAGE_PLANS` here,
  `LOCK_FROM_GATE`/`EXTEND_FROM_GATE` in `draft.model.ts`), which is why the wiki
  gained a single per-gate table (§2.10 What Unlocks When) rather than leaving a
  reader to assemble it from three sections.
