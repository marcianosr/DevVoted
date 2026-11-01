---
# DVTD-1z09
title: The game day is one UTC day on server and client
status: completed
type: task
priority: low
created_at: 2026-08-05T08:10:40Z
updated_at: 2026-10-11T09:07:53Z
---

**What:** The game day is one global day that starts at UTC midnight, on the server and in the browser alike.

**Why:** The countdown ran to the player's local midnight while the server rolled over at UTC midnight, so a Dutch player saw the clock hit zero one to two hours before new polls existed.

## Done when
- [x] The countdown reaches zero at the same moment the server starts the new day
- [x] The browser and the server name the same date for "today" in every time zone
- [x] A decision record states why the day is global and UTC
- [x] The wiki and the changelog state the reset time

## Notes
Original report: getTodayDateString() keys the daily seed on the server process date (UTC on Vercel), while useNextPollsCountdown counts to client-local midnight; queryKeys also call getTodayDateString in the browser, so cache keys drift too. Climb on bounced back to the board until the server date flipped. The legacy useCountdownToNextPoll mentioned originally no longer exists.

Decided 2026-10-11: UTC over Europe/Amsterdam (no DST logic, production dates already UTC) and over a per-player local day (shared seed, community board answer distributions would spoil later time zones, "filed today" and "fell today" must mean one day).

Reset times: NL 02:00 summer / 01:00 winter; New York 20:00 / 19:00; Los Angeles 17:00 / 16:00.

Possibly related to DVTD-25es (hydration text mismatch on /run): the countdown deadline is computed in useState on both server and client, which differ by the TZ offset. Not verified.

## Summary of Changes

dateUtils now names the game day in UTC (toGameDate via toISOString), gameDayRange replaces localDayRange for the three repositories that bound a day by timestamps, and nextGameDayStart replaces nextLocalMidnight for the countdown. The dead getMsUntilNextPoll is gone. Specs switch process.env.TZ to Auckland and Los Angeles so a local-time regression fails on any machine. ADR-196, wiki section 2.1 and 7.1 and the changelog state the UTC reset.
