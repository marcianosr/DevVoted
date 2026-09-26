---
# DVTD-n9js
title: Email notification preferences
status: todo
type: feature
priority: normal
created_at: 2026-06-30T13:21:03Z
updated_at: 2026-06-30T13:24:12Z
---

Users can manage email notification settings from their profile. All notifications default to OFF. Two opt-in types: daily reminders and run death notifications (when another player's run dies). Includes mailer setup (Resend), schema changes, settings UI, and email triggers.

## Scope

- [ ] Add email_daily_reminder and email_run_death boolean columns to users table (default false)
- [ ] Wire up Resend (or equivalent) as the mailer
- [ ] Settings UI on profile page — two toggles, both off by default
- [ ] Server fn to save preferences (authenticated, own user only)
- [ ] Daily reminder trigger: cron or scheduled job that fetches opted-in users and sends
- [ ] Run death trigger: hook into endRunForThresholdFailure → fetch all opted-in users → send batch

## Decisions

- **Run death**: daily digest email (not per-death), listing all runs that died the previous day with gate reached. Keeps email volume at max 1/day per opted-in user.
- **Daily reminder**: sent at 08:00 UTC (10:00 Amsterdam summer / 09:00 winter). Fixed UTC, no per-user timezone.
