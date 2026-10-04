---
# DVTD-dhl4
title: Hide what isn't relevant yet, badge what is new
status: completed
type: feature
priority: normal
created_at: 2026-10-02T10:19:47Z
updated_at: 2026-10-02T10:30:46Z
---

**What:** Things a player can't use yet stay off the screen, and anything met for the first time wears a "new" badge.

**Why:** Players miss audits and unlocks that arrive mid-run, and teasers for later gates are noise.

## Done when
- [x] The prep screen shows no audits panel before the first audited gate
- [x] The shop shows no locked services
- [x] An audit the player has never faced reads "new" on prep
- [x] A config or service unlocked during this run reads "new" in the shop
- [x] An ADR, the wiki and the changelog describe the rule

## Notes
Plan: ~/.claude-work/plans/can-you-show-a-robust-llama.md. New = first time ever for the account, derived from owned swatches and unlock timestamps; no seen flag.

## Summary of Changes

ADR-173. `isAuditFacedIn` (auditSchedule.model) is shared with the audit Dex; `gatesClearedBy` reads owned swatches back to gates. RunView gains `ownedSwatchIds` and `unlockedServiceIdsThisRun` (new `fetchServiceUnlocksSince`). Prep omits the audits panel before `AUDITS_FROM_GATE` and badges first-faced audits; the shop drops locked service rows and the fold, badges offers in `unlockedThisRun` and services unlocked this run. `NEW_BADGE` in shared copy, `NewBadge.ui`. Not checked in a browser: the Playwright browser was held by another session.
