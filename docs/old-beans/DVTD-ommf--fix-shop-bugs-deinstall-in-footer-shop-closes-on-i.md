---
# DVTD-ommf
title: 'Fix shop bugs: deinstall in footer + shop closes on interact'
status: completed
type: bug
priority: normal
created_at: 2026-05-06T10:45:31Z
updated_at: 2026-05-06T10:47:31Z
---

1) ConfigDeckFooter has no onDeinstall prop so users can't sell configs from the shop footer. 2) PostAnswerCarousel closes shop after install/rebuild, should only close on skip.

## Summary of Changes\n\n- PostAnswerCarousel: removed shopInteractedDate check from isShopOpen — shop now only closes on explicit skip\n- ConfigDeckFooter: added onDeinstall prop, threads down to ActiveCard\n- DailyPollContainer: added deinstallConfigMutation + isShopOpen guard, passes onDeinstall to ConfigDeckFooter only when shop is open
