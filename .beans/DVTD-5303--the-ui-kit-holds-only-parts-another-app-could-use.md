---
# DVTD-5303
title: The UI kit holds only parts another app could use
status: completed
type: epic
priority: normal
created_at: 2026-10-16T08:06:59Z
updated_at: 2026-10-16T08:40:11Z
---

**What:** Every game visual moves out of the shared kit and into the part of the game it belongs to; the kit keeps only generic parts.

**Why:** The kit is one folder of 126 parts where game screens sit beside buttons, so it cannot be reused and the game parts cannot call their own rules.

## Done when

- [x] The kit holds only parts that name no game concept
- [x] Every game visual, its test and its story live with the concept they show
- [x] A lint rule fails the build when the kit imports anything from the game
- [x] Storybook shows the same number of stories as before the move

## Notes

Decision: docs/adr/200-src-ui-is-a-portable-kit.md (amends ADR-010). Plan: ~/.claude-work/plans/it-s-actually-a-bit-keen-hamming.md.

Start only after feat/review-cards-and-spotlight is merged, on a fresh branch from fetched main.

Mapping (target presentation/ folder):
- run/gate: Swatch, SwatchChip, SwatchTrack, OutcomeReveal, GateChoice, GateOutcomeScreen, BandLadder, BandOutcomes, Objectives, Header, Lead
- run/run: PollScreen, PrepScreen, ReviewScreen, RunOverScreen, RunReadout, Accuracy, AccuracyTrack, Question, Choice, MatchingPairs, OptionChip, AnswerDiff, Verdict, PollFacts, PollScores, PollTiles, Scoring, Ledger, LedgerRows, EstimatePicker, SlaPicker, RebaseList, ApprovalList, BuildFooter, Balance, Figures, Audit, AuditsPanel (the audit lens is in run/domain per CONTEXT.md)
- run/build: Build, SlotBox, SlotTrack, Weight, weights.ts, WeightTrack, CoverageBar, CoverageRing, NewRunScreen, WarmBoot, Registry, RegistryControl
- run/config: ConfigChip, ConfigFacts, ConfigUnlock, InstallScale, Upgrades, Uninstall, Version, configs/ stories
- run/incident: IncidentDesk, IncidentsPanel
- run/shop: ShopScreen, upkeep.ts
- run/community: CommunityScreen, ClimbMap, Climber, ClimberCard, HallOfFame, PollSpotlight, CategoryLeader, Contribution
- account/profile: Profile{BestRun,Card,Climbing,Collection,Hero,Screen,Seats}, PlayerHeader, WornTitles, StatTiles, Standing
- collection/dex: Dex{Audits,Browser,Configs,Controls,Panel,Polls,Runs,Swatches}
- polls/poll: Author
- app/shell (new): AppNav, AppFooter, useNavRun

Stays in the kit: Badge, Button, Icon, Link, Logo, Modal, Panel, PanelTable, Field, TextField, TextArea, Select, Switch, Segmented, Tabs, Tooltip, Typography, Pick, Meter, Fold, Confirm, SearchField, CodeBlock, CodeText, Prose, Redaction, CountedFigure, NavDisclosure, DiscloseAll, Action, Screen, NewBadge, Keycap, CatchBoundary, NotFound, colors.ts, opensHere.ts, useBarHeight, usePageTheme, useRevealBeats.

Mechanics: git mv with exact paths (macOS case trap, never glob). Kit-internal ./X.ui imports become ~/ui/kanto-theme/X.ui; moved files are imported from ~/modules/.../presentation/X.ui. Each phase ends with npm run lint, npm run build and npm test green.

## Summary of Changes

src/ui/kanto-theme holds 37 primitives with zero DevVoted imports, down from 126 visuals. 296 files moved into their aggregates' presentation/ folders. Lint, typecheck, 337 test files / 6273 tests and the dead-code check pass; story exports match origin/main (811). The static Storybook build fails on main too (#tanstack-start-entry), so stories were checked with a temporary typecheck instead: no broken imports.
