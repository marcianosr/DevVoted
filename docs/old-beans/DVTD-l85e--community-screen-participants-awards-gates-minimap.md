---
# DVTD-l85e
title: 'Community screen: participants, awards, gates minimap, exposed deck'
status: todo
type: feature
created_at: 2026-07-02T10:57:03Z
updated_at: 2026-07-02T10:57:03Z
---

Removing the carousel dropped the post-answer 'Community' section from rendering. Rebuild these as a dedicated Community screen in the redesigned flow: participant avatars, Top Committers awards (first-to-answer, fastest, first-good, most-polls/most-correct in category), GatesMinimap (players in run + fallen), and ExposedConfigDeckDisplay. Components still exist (ExposedConfigDeckDisplay, GatesMinimap) but have no caller; getExposedConfigDeck server fn is orphaned. communityStats data is still fetched in DailyPollContainer.
