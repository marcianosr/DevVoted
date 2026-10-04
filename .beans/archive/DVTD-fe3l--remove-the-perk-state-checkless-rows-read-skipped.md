---
# DVTD-fe3l
title: Remove the perk state — checkless rows read skipped
status: completed
type: task
created_at: 2026-08-06T08:40:44Z
updated_at: 2026-08-06T08:40:44Z
---

Marciano (2026-08-06): the perks concept from the old gates-vs-perks split (rejected by ADR-016) lingered in the UI. Removed: ConfigRole perk renamed passive (role ordering survives), StatusBadge PERK variant (lavender, unreachable), StatusDot hollow-ring perk variant, dummy badge=perk call sites (shop offers, configure ghost) now skip. Copilot's row — the one live wearer — shows the gray skipped dot until the planned Copilot check lands (AskUserQuestion pick); its value slot still reads passive. Wiki 4.1 keeps the historical perks-only-build reference on purpose.

## Summary of Changes

Files: configRole.model(.spec), RoleList.ui(.stories), ShopScreen.ui, StatusBadge.ui(.stories), StatusDot.ui(.stories), Typography.stories, CHANGELOG. Verified: vitest 1069 passed / 110 files, tsc clean, oxlint + depcruise clean.
