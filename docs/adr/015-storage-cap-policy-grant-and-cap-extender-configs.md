# ADR-015: Storage-cap policy — one-shot grants and a soft over-cap

## Status

Accepted 2026-07-25. **Amends [ADR-006](006-session-run-mechanics.md) Decision 10**: the 1024KB cap becomes a *base* — cap-extender configs raise an effective cap per run, and removing an extender leaves storage soft-over-cap instead of clamping (⚠ marker inline there). Depends on ADR-005/006/008. Live-tuned numbers stay in `src/modules/run/rules.model.ts`; the clamp site is `addStorage` in `run.model.ts`.

> ⚠ The voucher shape below is itself superseded by
> [ADR-023](023-storage-capacity-is-a-subscription.md) (2026-08-09): the cap is
> raised by a subscription plan ladder, not a one-time purchase.

**Decision 3 superseded 2026-08-06** (DVTD-0h4n): the cap-extender is not a config. If raising the cap took a pipeline slot, every build would run it and the config roster's diversity would collapse into "extender + N free slots." It's a slot-free, sticky shop voucher instead — bought once, applies run-wide, never occupies a slot and so is never strippable. Decision 3's soft-over-cap-on-removal mechanic doesn't apply: there's no removal path for a purchase that was never installed. Overflow above the cap is now handled at the *Climb on* boundary instead (see [wiki §5.1](../wiki.md#51-storage-kb)), not via a per-config effective-cap calculation. Decisions 1, 2, and 4 (one-shot grant configs, their clip-at-cap behavior, and the no-selling non-decision) are unaffected.

## Context

Config unlocking (DVTD-9d7o) introduces config candidates whose effects touch the storage economy directly, and three mechanic holes surfaced before implementation:

1. A **one-shot grant** config (localStorage: `+128KB` on install) fires once and then does nothing — is it a config at all, or a consumable? And what happens when the grant lands near the cap (950KB + 128KB)?
2. A **cap-extender** config raises the cap while installed — what happens to storage above the base cap when the extender leaves the pipeline?
3. Both questions implicitly assumed a **sell** mechanic that the spec never defined.

## Decision

### 1. One-shot grant configs are ordinary configs, embraced as strip fodder

No consumable/item class. A grant config pays its value up front and then dead-weights a slot — which makes it the natural peel on a failed gate, since its value is already extracted: a *pre-paid strip shield*. That emergent role is the design, not a flaw. A separate slot-free item class (Balatro's tarots vs. jokers) is rejected until multiple one-shot effects exist to justify it.

### 2. Grants clip at the effective cap, and the shop shows the clip before purchase

ADR-006's invariant stands: faucets never push past the cap. A grant that would overflow is clipped, and the shop displays the clipped value up front (`+128KB → +74KB (capped)`). A purchase that is situationally bad is healthy roguelike design; a purchase that hides its waste is not.

### 3. Cap-extenders raise an effective cap; removal leaves storage soft-over-cap

`effectiveCap = STORAGE_CAP_KB + sum(installed cap bonuses)`. When an extender leaves the pipeline while storage exceeds the shrunken cap, the excess **persists** but all gains freeze until storage drops back under:

```
addStorage(current, income) = min(current + income, max(effectiveCap, current))
```

Never confiscate, never gain while over cap. The invariant is preserved literally — *faucets* still never push past the cap; only a cap shrink can strand storage above it, and spending drains it back down. The alternative (instant clamp) would double-punish a failed gate: lose the config *and* the KB it was holding.

### 4. Non-decision: there is no selling

> **Superseded (2026-07):** selling landed with the config action popover (DVTD-86nr) — `sell()` in `run.model.ts` refunds half the draft cost (`sellRefund`), fixed configs excluded. As anticipated below, Decision 3's over-cap rule covers the refund path (`addStorage`). The original rationale is kept for the record.

Configs enter via the shop draft (ADR-008) and leave **only** via strip (ADR-006 Decision 6). The economy stays one-directional: storage → configs, never back. Strip already forces build pivots, which is the job selling does in Balatro. Recorded so a future "add selling" idea starts from a deliberate absence, not an oversight — and if it ever lands, Decision 3's over-cap rule already covers it.

## Consequences

- **Positive**: one over-cap rule uniformly answers strip and any future removal path. Strip choice gains texture — peeling the extender preserves build power but freezes income, a real dilemma instead of an obvious pick.
- **Negative / to watch**: grant-config pricing needs care — priced too far under the grant it becomes free money plus a strip shield. The over-cap state needs a UI signal (storage meter past 100%) and the shop needs clip-preview support before either config ships.
- Implementation touchpoint: `addStorage` (`run.model.ts`) becomes effective-cap-aware; cap bonuses live on config definitions like other effects.
