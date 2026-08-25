---
# DVTD-d5kf
title: 'Config: sell value that climbs each gate'
status: draft
type: feature
created_at: 2026-08-24T15:12:07Z
updated_at: 2026-08-24T15:12:07Z
parent: DVTD-72d9
---

A config whose effect is that selling gets better the longer it is installed: each
gate it survives, your configs sell back for more.

## The seam it plugs into

- `sellRefund` (`config/domain/config.model.ts`) is flat: `floor(draftCost / 2)`.
- `sellRefundIn` (`shop/domain/draft.model.ts`) is the pipeline-aware version, and it
  is already the place two configs bend the sale:
  - **WTFPL** zeroes every refund while installed, its own included.
  - **Freemium** makes a sale refund half of what the build actually *paid*, not half
    of list. The comment says it plainly: no refunds on discounted goods.
- So the hook exists and every price-quoting surface already reads it. This config adds
  a third factor there, it does not need new plumbing.

## The exploit to close before anything else

If the refund can ever exceed what the build paid, buy-and-sell churn becomes a
storage faucet, and the shop's other economics stop mattering. Two ways it gets there:

- The ramp alone, once it climbs past 100% of the draft cost.
- **Freemium plus this config**: buy at half price, sell at a climbing fraction of what
  you paid. Freemium's existing rule already anticipates exactly this shape.

Rule to hold: a sale never returns more than the build paid for that config. Whether
the ramp then caps at 100% or asymptotes below it is the tuning question.

## Open design questions

- **What the ramp counts.** Gates cleared while installed, or gates cleared in the run.
  These differ the moment the config is sold and rebought, and the answer decides
  whether the config is a commitment or a thing you flip.
- **Whether the ramp resets** when the config leaves the pipeline, including when a
  missed gate peels it (ADR-037).
- **Whose sales improve.** All configs, or only ones bought after it was installed.
- **Ramp shape.** Flat percentage points per gate, or a rarity-scaled amount. Deep gates
  already move more KB, so a percentage compounds against a bigger base late.

## Why it is not just Freemium again

The roster's economy configs pay for holding: interest on storage, storage on clear,
a cheaper shelf. This one pays for *churn*, which is the opposite instinct, and it is
the first config that makes selling a build decision rather than a cleanup. Worth
confirming that separation survives contact with the numbers, since "buy cheaper" and
"sell dearer" collapse into the same lever if both just mean "more KB in the shop".

## Notes

- Configs are pure enhancements since ADR-035: this does **not** owe the gate a check.
  Bound it with its price and a readable condition instead.
- Name it something real and recognizable from the ecosystem, per the roster's naming
  rule. It should say "your stuff is worth more later" without a vibe phrase.

## Todo

- [ ] Pick what the ramp counts and whether it resets
- [ ] Cap the refund at what was paid, and write the spec that asserts it
- [ ] Check it against WTFPL (zeroes sales) and Freemium (halves the base) explicitly
- [ ] Name it
- [ ] Add to `CONFIG_LIST` with its rarity and draft cost
