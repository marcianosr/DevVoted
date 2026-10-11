---
# DVTD-ckbl
title: Optional supporter tips with a cosmetic thank-you and a public costs page
status: draft
type: feature
priority: normal
created_at: 2026-10-04T12:25:26Z
updated_at: 2026-10-08T13:13:40Z
---

**What:** Players who want to can support DevVoted with a tip and get a cosmetic thank-you, and a public page shows what the game costs and what came in.

**Why:** A small side income that covers hosting, without forcing anyone to pay and without money ever buying power in a shared daily game.

## Done when
- [ ] Decided: GitHub Sponsors or Ko-fi as the tip jar
- [ ] A supporter gets a cosmetic (border, title or swatch) and nothing that touches a run
- [ ] A public support page states monthly costs, what came in, and how much of the costs it covers
- [ ] An ADR records that money never buys power

## Notes
Post-launch: the launch bean DVTD-erjz freezes monetization until after launch. At its target of 100 daily players, expect donations to roughly cover hosting (Supabase, Vercel, domain, Sentry), not more.

Shape:
- Tip jar is an external link, so there is no payment code in the app (no PCI, VAT or refund handling).
- Supporter flag on the account, granted manually first, later maybe by a Sponsors/Ko-fi webhook. The cosmetic rides the appearance tab (ADR-142/144).
- Support page: costs table plus a "costs covered" bar.
- Maybe later, once there is real traffic: a sponsored category poll pack from a dev-tool company, clearly labelled as sponsored.

Rejected:
- Paid revive (DVTD-uret): pay-to-win in a shared-seed game with leaderboards (ADR-131).
- Ads: hurt the feel and pay pennies at this scale.
- Paid cosmetics shop or loot boxes: more code and legal surface, and it pushes the design toward FOMO.

## Decided 2026-10-08

Unfrozen. Ships after the landing page and guest play (DVTD-nr8f) so a stranger can see it, and before the first stranger-facing post. Still an external link with no payment code. Money order agreed the same day: tip jar, then the pack-ownership schema (sell nothing yet), then a company league if money before scale is wanted, then a sponsored category pack once there is traffic.
