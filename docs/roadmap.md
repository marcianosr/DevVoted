### Roadmap MVP

Phase 1: Core Loop ✅ ship this before anything else
[x] Answer polls (single / multiple choice)
[x] Start runs mechanics
[x] XP threshold mechanics (3-poll sets)
[x] Storage mechanics + economy (buy/sell configs, pay with storage)
[o] Shop mechanics (3 random offers)
[] Implement rerolls (Fibonacci cost) [Critical]
[o] Create 6–8 configs with effects [Critical]
[] Show XP breakdown and result feedback after each poll [Critical]
[] Run end screen (gameover, stats, restart) [Critical]
[] Onboarding/help modal for first-time users [Critical]
[] Fix refresh-to-reanswer bug [Critical]
[] Fix immediate-run-end bug [Critical]
[x] Refactor service file architecture [Critical]
[] Remove "penalizeRun" since it's not used?

Phase 2: Early Meta Layer
[] Traceability (poll stats for balancing)
[] Balance threshold + config values based on data
[] Authentication (GitHub/Google)
[] Deployment
[] Leaderboard (only if trivial; else Phase 3)
[] Old-to-new system migration
[] Streak bonuses (beyond the basic +2 per set)

Phase 3: Expansion
[] Basic CSI (global average, no per-category complexity)
[] Multiple choice formula refinement
[] Knowledge-based awards (start with 2)
[] Boss challenge (start with 1 type)
[] 20 unlockables (cosmetic or config)
[] New categories (Java, AI, etc.)
[] Add new polls
[] Stickers / cosmetics
[] Slackbot
[] Fix low-hanging sonar issues
[] Polish flows / UI

=====================================================================

[x] Answer polls both multiple choice and single choice (done)
[x] Start runs mechanicsn(done)
[x] XP threshold mechanicsn(done)  
[x] Storage mechanics
[x] Configs (come up with a few to play with) mechanics
[x] Economy mechanics (actually "pay" with storage)
[x] Sell configs
[x] Shop mechanics

[o] Update UI Realtime

- [x] Poll answered
- [x] Configs

[x] Select random poll to "open" for today and open/close poll for the next day
[x] Integrate 3-poll "sets": Threshold is only checked at every third poll
[] Show XP breakdown and result feedback after each poll
[] Refactor service files
[] Run end: Show gameover and stat screen: Allow user to start a new run
[] Implement rerolls
[] Show leaderboard
[] Create atleast 6-8 configs with effects
[] Old to new system
[] Add onboarding screen or help modal for first-time users
[] Traceability

[] Balance the game (threshold, configs)
[] Balance treshold system: now its \* 2, should this gradually increase based on multipliers/configs/data storage?

[] Authentication (Github / Google)
[] Deployment

### Phase 2:

[] Integrate basic CSI
[] Check multiple choice formula
[] Streak bonusses mechanics
[] Create 20 unlockables (long lasting)
[] Implement at least 2 knowledge-based awards (e.g., CSS Connoisseur, Markup Master)
[] Trigger & resolve at least 1 boss challenge condition (e.g., "The Enigma")
[] AI design soms stickers
[] Add new polls (currently Slack'ed to myself)
[] Introduce new categories: Java, AI (Talk with Guido if possible)

### Bugs

[] When answering a poll, refresh, the poll can be answered again. When I switch tabs for instace, it gets refetched on the client and I see it's answered (for good) - I need to check if the user already answered on the server
[] Show end of run immediately when 3/3 polls and threshold is not met
