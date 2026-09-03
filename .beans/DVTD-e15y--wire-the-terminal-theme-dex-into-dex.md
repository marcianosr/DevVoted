---
# DVTD-e15y
title: Wire the terminal-theme Dex into /dex
status: todo
type: feature
priority: high
created_at: 2026-09-03T07:54:50Z
updated_at: 2026-09-03T07:54:50Z
parent: DVTD-tduu
---

Point `/dex` at the terminal-theme Dex. The run loop already renders terminal screens through the nine `*View` adapters (DVTD-gnw0), so the Dex is the last player-facing surface still on modern-theme.

Today: `src/routes/_authed/dex.tsx` mounts `Dex.component`, which renders `~/ui/modern-theme/screens/DexScreen.ui` with four tabs (Polls, Configs, Audits, Gates) and the three `*View` components plus the legacy `ConfigdexPanel`.

The kit: `~/ui/terminal-theme/screens/DexScreen.ui` (shell: title + `Tabs` + one `role="tabpanel"` child) and six panels, story-only since DVTD-sy0k and DVTD-6q1m: `PollsPanel`, `ConfigsPanel`, `AuditsPanel`, `GatesPanel`, `SwatchesPanel`, `StoragePanel`. Panels are hook-free by ADR-010, so every bit of state (active tab, poll sub-view, config sub-view, selected config) lives in `Dex.component`, exactly as `DexScreen.stories.tsx` holds it now.

Shape: `Dex.component.tsx` stays the one Tier-2 adapter. Swap the screen import, add one prop mapper per panel next to the existing domain calls, and keep the tab counters honest (`gatesClearedIn`, `auditsFacedIn`, `polldexCoverage`).

## Panel by panel

| panel | props it wants | source | gap |
| --- | --- | --- | --- |
| `GatesPanel` | `gate`, `demand`, `name`, `theme`, `finish`, `best`, `cleared`, `locked` | `gatedex(ownedSwatchIds)`: `coverageDemand`, `swatch`, `state` | `best` (best coverage ever reached at that gate) has no source; `run_states.coverage` is per-run and resets per gate under ADR-035 |
| `AuditsPanel` | classes of `4xx`/`5xx` with `code`, `name`, `rule`, `faced`, `beaten`, plus `unseen` and a `note` | `auditdex(gates, runs)`: `runsFaced`, `runsBeaten`, `tier`, `rule`; `code` off `AUDITS` in `audit.model.ts` | grouping by status class, the per-class `unseen` count and the `note` copy are new mapper work; `AuditdexEntry` carries no `code` yet |
| `PollsPanel` | `categories` with `seen`, `total`, `correct`, plus sub-views category/missed/unseen | `getPolldex()` entries aggregated by `categoryCode` | terminal panel is category-aggregate only; the live tab is a per-poll list with dex numbers, filters and the reveal toggle (see decision 4) |
| `ConfigsPanel` | `label`, `family`, `slots`, `seen`, `best`, `maxVersion`, `installs`, `firstSeenGate`, `effect` | `CONFIGS` roster, `maxLevelOf` | `seen`, `best`, `installs`, `firstSeenGate` are per-account facts nothing records (see decision 3) |
| `StoragePanel` | `rungs`, `locked` | `STORAGE_PLANS`, gates cleared via the `*_FROM_GATE` floors | the real unlock condition was explicitly deferred by DVTD-6q1m |
| `SwatchesPanel` | `swatches` with `earned` | same `ownedSwatchIds` as Gates | duplicate of Gates (see decision 1) |

## Rules that must survive the swap

- Redaction (Marciano, DVTD-1o2z): a locked gate withholds audits, slots and plans as counted `???` chips; shop actions stay named. Audit redaction keys on the audit's own tier, not the gate's state, so the two tabs never contradict.
- The Polls query owns its own loading and error state. Gates and Audits read `owned_swatch_ids` alone and must not blank while polls are in flight.
- `.ui.tsx` may import types only from `src/modules/`. The roster values currently sitting in the stories move into `Dex.component`, not into the panels.

## Decisions needed

1. **Swatches tab: in or out.** DVTD-1o2z deleted it from modern-theme as thirteen identical rows (clearing a gate is what awards its swatch, so both counters read `8/13`); the mock brings it back. My pick: out, five tabs.
2. **`GatesPanel.best`.** No source. My pick: drop the column for now rather than print a per-run number under a per-gate heading; a real "best coverage at gate N" needs storing it when a gate is played.
3. **Configs columns.** No config unlock or install ledger exists (DVTD-2try, DVTD-g6k0 pending). My pick: ship the roster at 30/30 with `seen`/`installs`/`firstSeenGate` withheld rather than faked, and revisit after the checklist UI lands.
4. **Per-poll list.** The category table is not a replacement for browsing individual polls with the reveal. My pick: keep the per-poll list as a sub-view alongside category/missed/unseen, which needs a terminal-styled poll row.

## Todo

- [ ] Decide 1 to 4 with Marciano
- [ ] `Dex.component.tsx`: terminal `DexScreen`, tab list, panel state
- [ ] `gatesPanelProps` mapper + spec
- [ ] `auditsPanelProps` mapper (status-class grouping, unseen counts) + spec
- [ ] `pollsPanelProps` mapper (per-category aggregate) + spec
- [ ] `configsPanelProps` mapper + spec
- [ ] Storage tab: derive the reached rung, `locked` before the first shop
- [ ] Per-poll sub-view, if decision 4 says keep
- [ ] Delete the modern-theme Dex once unused: `modern-theme/screens/DexScreen.*`, `GatesView`, `AuditsView`, `PollsView`, `ConfigdexPanel` (leaves four modern-theme consumers, all in the legacy `/_authed/run` set)
- [ ] CHANGELOG entry, wiki check
- [ ] Verify: `npm run lint`, `npm run build`, stories tsconfig, `npm test`
