---
# DVTD-mvhv
title: 'PvP thwarting: where a config may affect other players'
status: draft
type: feature
priority: low
created_at: 2026-08-20T14:50:46Z
updated_at: 2026-08-20T14:50:46Z
---

Backlog discussion, split out of the Freemium design (2026-08-20). Marciano wants 'thwarting' configs: effects that hurt other players. The first attempt (Freemium: 'everyone else pays 2x in the shop') was rejected, and the reasons define the design brief for any future attempt.

## Why the naive version fails

1. **Symmetric effects self-cancel.** Every holder is also 'everyone else' from another holder's view, so at real adoption everybody pays 2x prices AND a hold bill: a prisoner's dilemma whose dominant strategy is universal loss. Same class of error as the measured width self-cancellation (see build-aim-beats-build-count).
2. **The patch is worse.** 'Prices double for everyone who does NOT hold it' makes the config mandatory, and a config every build must run is a slot removed from the game.
3. **No attribution.** The victim cannot see, attribute or counter the tax, so it reads as a bug rather than as someone playing against them.
4. **Determinism.** Shop prices are pure functions of the roster; live cross-player state would put non-determinism into reducers that ADR rules keep pure (seeded randomness only).

## Design brief for a version that could ship

- **Asymmetric, not symmetric** — it must not tax the holder's own cohort.
- **Async, resolved from completed runs** — never live (checks-never-depend-on-social-data: ghosts are completed runs).
- **Attributable** — the affected player can see what happened and who/what caused it.
- The surface already designated for this is **dead-run loot**: DVTD-545v (loot storage from other players when their run ends) and DVTD-wra4 (gate bounty, unclaimed bounty feeds ghost loot). A thwart there is legible because the victim's run has already ended.

Candidate shapes to evaluate when this is picked up: deny scavengers your run's loot; take a larger cut of the pool; salt the pool. Note the withhold-never-falsify rule rules out poisoning shared data (e.g. Telemetry splits).

Related: DVTD-545v, DVTD-wra4, DVTD-in1b (Open Source: unbanked storage to a category pool).
