---
# DVTD-s4cb
title: 'Hold-to-Earn Awards: live bonuses while holding an award'
status: draft
type: feature
created_at: 2026-05-20T10:30:33Z
updated_at: 2026-05-20T10:30:33Z
---

## Concept

You don't just collect awards in DevVoted. You **wear them**, and they pay you while you do.

The moment you take an award — the second your HTML correct count edges past whoever held *Markup Master* yesterday — the award doesn't just sit on your dev card. It activates. It starts giving you something. Maybe a passive +5% coverage gain on HTML polls. Maybe an extra reroll per gate. Maybe a small storage trickle every round. The award becomes a **live engine**, paying out for as long as you're the leader.

But here's the catch: **you only hold it while you're the best**.

The second someone else's stat creeps past yours, the award flips owners. The bonus stops. Mid-run. The coverage that used to come easy now feels normal again. You glance at the awards page. Someone took Markup Master. Their dev card lit up. Yours just dimmed.

## Why this matters

- **Compounding stakes.** The leader gets bonuses, which makes it easier to stay leader, which makes it more valuable to dethrone them.
- **The awards page becomes a scoreboard, not a museum.** Holding is the goal, not earning.
- **Per-award identity.** Different awards = different bonuses. Markup Master shapes how an HTML run plays; Speed Demon might be timing-based; King of the Rock might give streak forgiveness.
- **Natural pull toward behavior awards.** Players who only chased HTML suddenly care about First Good — because it has a bonus they want.

## Open questions / design notes

- **Bonus magnitude.** Too strong → rich-get-richer. Too weak → no one cares. Start small (~3–5% effects) and tune.
- **Lose-state feedback.** When an award flips owners, BOTH players need to know immediately. Push notification, banner on next poll, something tactile. Otherwise the loss is invisible and the tension dies.
- **Active-run gating.** Holders only get the bonus inside an active run. Idle holders don't passively accrue value — pulls people back to play.
- **Per-award bonus definitions.** Need a catalog mapping each award → its bonus effect. Probably co-located with the award definition in src/domains/awards/data/awards.data.ts.

## Todo (to refine before starting)

- [ ] Decide bonus effect type system (coverage mult, storage tick, reroll, streak forgiveness, etc.)
- [ ] Spec lose-state UX (notification channel, banner copy, timing)
- [ ] Decide where bonus application lives in the turn flow (likely score.service or runs domain)
- [ ] Decide refresh cadence — recompute holders on every poll answer? On run completion? Cached?
