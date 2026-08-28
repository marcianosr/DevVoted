# ADR-023: Storage capacity is a subscription — the plan ladder

## Status

> ⚠ **Superseded by [ADR-045](045-spots-come-from-gates-kb-rents-more-on-top.md)
> (2026-08-28)**: the subscription is gone. The KB cap it rented is deleted rather
> than moved — at the balances a run actually reaches it was never binding — and
> the width it had been re-aimed at by ADR-044 now comes from a fixed gate
> schedule, with KB buying only an early arrival. Nothing below is live. What
> survives is the Context: a flat one-time cap purchase converges every run, which
> is why the answer was never a voucher.

Accepted (2026-08-09, Marciano, DVTD-rf5c). **Supersedes the cap-extension
voucher direction** ([ADR-015](015-storage-cap-policy-grant-and-cap-extender-configs.md)
Decision 3 as re-decided by DVTD-0h4n): the cap is no longer raised by a
one-time purchase at all. Also records why the scrapped storage-config shop
(DVTD-xmu7) is not coming back. Live-tuned numbers stay in
`src/modules/run/rules.model.ts` (`STORAGE_PLANS`).

## Context

DVTD-xmu7 shipped a second shop of six leveled, slot-free "storage configs"
(draft −%, refund +%, payout +%, cap +KB). Marciano cut it the same week, on
sight: coefficient effects are invisible knobs the player never feels, and a
dedicated screen made spending on them a bookkeeping detour with no tension.
The removal note confirmed the effects were never even wired into the real
formulas — cosmetic-only, which is the symptom of the design problem, not just
a bug.

The 2026-08-09 brainstorm reframed the question: storage upgrades are only
interesting *because of* the 512KB cap and the overflow-forfeit at Climb on.
A flat voucher (DVTD-0h4n's shape) fails that test too — "can I afford it"
is eventually always "yes", so every run buys the same thing and runs
converge instead of varying.

## Decision

1. **Storage capacity is a subscription.** Every run opens on the free tier;
   bigger caps carry a recurring bill. The ladder (`STORAGE_PLANS`): tier 1 —
   512KB, free; tier 2 — 640KB at 8KB/gate; tier 3 — 768KB at 16KB/gate.
   Tiers stay internally unflavored (no Free/Pro/Enterprise skin) until the
   mechanic proves fun.
   > ⚠ Amended by [ADR-030](030-gate-staged-storage-plans.md) (2026-08-11): the
   > ladder now runs to seven rungs (3MB cap) and each rung is gate-staged. The
   > subscription mechanic below is unchanged.
   > ⚠ Amended again by [ADR-044](044-capacity-is-spots-money-is-kb.md)
   > (2026-08-28): a rung now sells the pipeline's **width** in spots and the KB
   > cap rides along, five rungs at 4/8/12/16/24 spots. Still a subscription,
   > still billed pass or fail, still auto-downgrading — only the product changed.
2. **The bill collects on every closed window, pass or fail**
   (`chargeStorageBill`, first thing in `closeWindow`, before the clear
   payout). A failed gate pays nothing and still bills: the subscription is a
   liability exactly when the run wobbles, which is what makes upgrading a
   real decision instead of an auto-buy.
3. **An unpayable bill auto-downgrades to the free tier**, collecting nothing —
   no partial payment, no debt. The provider suspends you; a broke run can
   never be soft-locked by its own plan. (Storage sat below the bill, so no
   overflow can burn on this path.)
4. **Switching is a shop action, both directions, and only there.** A
   voluntary downgrade clamps on the spot — whatever sits above the new cap
   burns immediately, and the shop names the burn on the button before the
   click. Cancel-after-the-big-purchase timing is deliberately a skill.
5. **The engines-vs-infra split.** Anything that *earns* storage is a pipeline
   config under the Config Rule (ADR-016) — slot, check, strippable; IndexedDB
   is the template. Slot-free purchases may only change the *container's
   rules* (today: cap size), never multiply power — that line protects the
   legendary exception (ADR-016: Copilot/AGENTS.md is the only check-free
   effect).
6. **No second shop.** The ladder is a section of the one existing shop.

## Consequences

- `RunState.storagePlan` (tier, optional — old snapshots read as free),
  `gateBillKb`/`planDowngraded` report fields, and a `change-plan` action.
  `finishReward` clamps to the plan's cap instead of `STORAGE_CAP_KB`.
- The prep screen's stake receipt names the bill ("pass or fail"), the shop
  lists the ladder with the current rung marked, and the reward/strip screens
  carry the bill receipt and the unpaid-downgrade notice.
- Watch item: victory banks 100% of leftover storage, so tier 3 near the
  summit is a meta-farming lever (+256KB bankable for 16/gate). Accepted as
  the Banker archetype working as intended; if it proves degenerate, compute
  the archive credit against the tier-1 cap.
- ADR-015's Decisions 1/2/4 (one-shot grants, clip-at-cap, no-selling record)
  are unaffected.
