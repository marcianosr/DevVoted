---
# DVTD-0imu
title: 'Unlockable titles: Poll Editor for used submissions'
status: draft
type: feature
priority: low
created_at: 2026-09-06T12:14:49Z
updated_at: 2026-09-06T12:14:49Z
---

Cosmetic account titles earned through play, starting with "Poll Editor": granted when 5 polls you submitted get used in the mix (drawn into daily_polls / served in runs). Decided 2026-09-06: title is DISPLAY-ONLY — the poll-editor permission role stays admin-assigned; the earned title needs its own concept (rename or a titles table) so it does not collide with UserTitle's role labels.

## Why it is not in the config-unlock ledger

The metric fires outside the earning user's session (someone else's run / the daily draw uses your poll), so it cannot ride objectiveIncrementsFor at the dispatch seam. It is a derived count over polls.created_by joined against usage — evaluate on read or on the daily-mix draw, not per run action.

## Open questions

- Prerequisite: no public poll-submission flow exists — only poll-editors/admins create polls today, which makes the objective circular until submission ships.
- Announce surface: gate-clear/game-over do not fit an out-of-session grant; profile/Dex badge or a site-level "since you were away" line?
- Locked-title display: ??? row in a Dex tab, or profile-only?
- Storage: user_title_unlocks table vs derived-on-read (derived loses unlocked_at + the announce moment).
