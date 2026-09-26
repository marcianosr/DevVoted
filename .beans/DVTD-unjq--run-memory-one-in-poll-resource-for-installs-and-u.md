---
# DVTD-unjq
title: 'Run memory: one in-poll resource for installs and uses'
status: draft
type: feature
created_at: 2026-09-02T12:51:59Z
updated_at: 2026-09-02T12:51:59Z
---

Concept from the 2026-09-02 Docker discussion with Marciano. NOT the rejected rename: the earlier same-day verdict killed memory-as-a-relabel-of-slots. This is a different proposal that came out of pulling on the idea — memory as the game's one in-poll resource, which slots today are not.

## The concept

Capacity is renamed run memory and gains a second job: installs occupy it (as slots do today) and USING a config spikes it for that poll. ESLint's eliminate, peeks, every active use draws from the same headroom the build lives in. KB leaves the poll entirely and becomes shop-and-gate money only.

What this adds that no rename does: today a full build is strictly good — free room has zero value. Under this, headroom is a resource you deliberately keep (install this 8-slot config and lose the room ESLint needs at the gate), the meter is live during a poll (the Docker feeling: baseline occupancy + working spikes), and buying capacity has a second honest motive: room to breathe, not just room to install.

## Decisions taken in discussion (2026-09-02)

- **Spike is the global rule**: a use occupies memory only for its poll, freed on resolve. Persist-until-gate-end is too harsh as a default but too interesting to drop — it becomes config-level flavor (a heavy tool whose cost lingers; sibling of DVTD-mpd4's Memory Leak).
- **In-poll costs move off KB.** One currency per screen: memory in the poll, KB in the shop. Needs a faucet/sink recheck since KB loses its in-poll sink.
- **Memory never banks.** Win or die, leftover headroom pays nothing — rewarding unspent room makes hoarding optimal and kills the mechanic. Reward channels (archived KB, swatches, Configdex) unchanged. Same principle as coverage-is-score-storage-is-reward.
- **Rename and mechanic ship in the same pass**, one ADR. A fiction swap alone was rejected; the mechanic is what pays for the ~70-file rename.

## Open questions

- [ ] Display: the meter must never read as money. Byte units collide with KB (formatKb auto-promotes balances past 1024 KB to MB — the killer from the Aug KB-as-room post-mortem). The track stays; decide what the caption counts (bare integers like today, or resolve the byte collision deliberately).
- [ ] Use-cost table: which uses cost how much. Costs must VARY or the kept reserve becomes a flat tax (every build effectively N smaller) instead of a decision.
- [ ] What each existing KB use-price becomes in memory terms; whether 429 Too Many Requests is redundant once memory bounds uses.
- [ ] Refusal states: a spike may never exceed the cap (use refused, copy needed); installs can still overfill via peel/strip — the over-capacity lock survives and may finally wear the OOM name (precedent: audits are HTTP statuses, 507 exists).
- [ ] Faucet/sink rebalance after KB stops being spent mid-poll.
- [ ] Migration: slots→memory across ~70 files, RunState jsonb (db:refresh, like ADR-048), specs. Units-bug class does not apply to the rename half (meaning unchanged) but DOES apply to the spike half (used-now vs installed are two numbers that must never be derived from row counts).
- [ ] New-player exposure: stage it — documented feedback says first runs already overwhelm.

## Relations

- DVTD-mpd4 (Memory Leak config) — the persist-flavor sibling; its footprint-growth is this system's config-level expression.
- DVTD-mdit (build dashboard) — the live-usage column is where the spike becomes visible.
