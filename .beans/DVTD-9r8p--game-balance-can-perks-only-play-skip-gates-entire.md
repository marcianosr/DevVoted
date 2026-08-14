---
# DVTD-9r8p
title: 'Game balance: can perks-only play skip gates entirely?'
status: scrapped
type: story
priority: normal
created_at: 2026-07-27T10:44:49Z
updated_at: 2026-07-31T11:03:37Z
parent: DVTD-bojz
---

Now that configs split into gates (judge you) and perks (help you), a balance question falls out directly: can a player just stack perks and coast through the game without ever engaging with a gate config, effectively cheating the intended challenge loop? And symmetrically — if a player *can* ignore gates, what's the actual incentive to install one beyond "it pays a bigger reward"? If reward-chasing is the only reason, gates risk being purely optional min-max bait rather than a meaningful judge of skill.

## Open questions

- [ ] Is it currently possible to clear a run/gate using only perks, with zero gate configs installed?
- [ ] If yes — is that a problem, or is "perks-only, slower/safer" a legitimate playstyle (vs. "gates, higher risk/reward")?
- [ ] Beyond higher reward KB, what else could make installing a gate config compelling — unlocks, required for certain pipelines, mandatory at higher gate numbers?
- [ ] Should some pipelines/gates require at least one gate config installed, rather than leaving it fully optional?
- [ ] Does "judge you" only matter if failing a gate has a real cost — what's the downside of a gate config today vs. just not installing one?
- [ ] Is this a balance problem at all difficulty tiers, or only late-game once storage/perks compound?

## Todos

- [ ] Audit current configs against the gates/perks split (DVTD-bojz) to confirm which are actually gates today
- [ ] Playtest/simulate a perks-only run to see how far it gets
- [ ] Decide whether gates need a non-reward incentive (or restriction) to stay meaningful
- [ ] Write up the decision as a follow-up to DVTD-bojz once resolved

## Reasons for Scrapping

Closed by the Config Rule (wiki §4.1, DVTD-bojz resolution): every config carries a check, so a perks-only build that skips gates cannot exist — a build carrying few checks simply took little risk and earns least. Implemented 2026-07-31 (ADR-016).
