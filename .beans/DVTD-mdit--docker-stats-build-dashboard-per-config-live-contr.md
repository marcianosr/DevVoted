---
# DVTD-mdit
title: 'Docker-stats build dashboard: per-config live contribution column'
status: draft
type: feature
created_at: 2026-09-02T08:53:50Z
updated_at: 2026-09-02T08:53:50Z
---

Salvaged from the 2026-09-02 Docker run-memory exploration (rejected — slots stay). The Docker metaphor's real content is the dashboard, not the meter: a docker-stats-style column on the build table showing each config's live contribution this run (checks fired / coverage contributed / focus triggers — the CPU% analogue). Pure presentation on top of slots; no capacity change.

## Scope

- Per-config live contribution stat on the build table (terminal theme fits the docker ps look already).
- Usage framing stays the existing SlotTrack — never print a byte unit on capacity (ADR-044 D1).
- A status dot is OUT: decorative without a stop/restart mechanic, which is parked (every restart cost found so far is the banned per-use fee).

## Overlap

DVTD-144r owns the community-level usage numbers (install/pick/keep rate) — that bean's data is this column's aggregate cousin. This bean is the RUN-LOCAL live stat, computable from RunState alone, no telemetry plumbing. Telemetry's level-gated reveal (percentages at L1, sample size at L2) is the precedent if any of it becomes paid information.

## Todos

- [ ] Pick the one stat worth a column (checks fired vs coverage contributed vs focus triggers)
- [ ] Decide which surfaces show it (build table on prep/shop only, or in-gate too)
- [ ] Mock it in the terminal theme before wiring
