### Roadmap MVP

Season 1: Core Loop ✅ ship this before anything else
[x] Answer polls (single / multiple choice)
[x] Start runs mechanics
[x] XP threshold mechanics (3-poll sets)
[x] Storage mechanics + economy (buy/sell configs, pay with storage)
[x] Shop mechanics (3 random offers)
[x] Run end screen (gameover, stats, restart) [Critical]
[x] Refactor service file architecture [Critical]
[x] Remove "penalizeRun" since it's not used?
[x] Traceability (poll stats for balancing)
[x] Implement rerolls (Fibonacci cost) [Critical]
[x] Basic XP scoring system mechanics [Critical] (and redo flow)

| Scenario     | Correct/Total | Wrong | Score | Percentage |
| ------------ | ------------- | ----- | ----- | ---------- |
| Perfect      | 2/2           | 0     | 1.0   | 100%       |
| Good         | 2/2           | 1     | 0.75  | 75%        |
| Your case    | 1/2           | 1     | 0.625 | 62.5%      |
| Partial only | 1/2           | 0     | 0.75  | 75%        |
| All wrong    | 0/2           | 2     | 0.0   | 0%         |

[x] Seasons: An excuse to introduce new gameplay mechanics such as point systems, seasonal events, limited-time polls, and exclusive rewards [Critical]
[] Show XP breakdown [Critical]

[x] Leaderboard [Critical]

    [x] Best total XP overall (highest XP)
    [x] Best in category (highest XP)
    [x] Best streak (highest streak)
    [x] Live run leaderboard
    [] Show who answered today

[x] Create simple linear streak bonus amp
[] Events?
[] Rarity tiers
[] Create a single "stake" in DB (no UI)
[] Traceability

    - [] Timestamps on answer

[o] Create 1-15 configs with effects [Critical]

- .js/.css/.ts/.html/.jsx/.git/.package.json- Category amps (+0.5)
- localStorage - Extra storage
- try/catch - Safety net for threshold
- eslint - Disable wrong option
- prettierrc - Round XP up

[] Balancing

    [] Threshold formula refinement
    [] Starting storage
    [] Storage growth over time
    [] Config costs
    [] XP gain balance

[] Upgrade packages
[] Authentication (GitHub/Google)
[] CI/CD and Deployment
[] Old-to-new system migration
[] Some UI polish so it isn't a mess
[] Test daily poll cycle
[] Onboarding/help modal for first-time users [Critical]
[] Fix refresh-to-reanswer bug [Critical]
[] Fix immediate-run-end bug [Critical]
[] Reroll bug: when rerolling it walks behind

Season 2: Early Meta Layer
[] Very basic CSI: (correct / total) × streak)
[] Store "phase" per player in run. This prevents accidental shop miss
[] Streak bonuses (beyond the basic +2 per set)
[] Fix low-hanging sonar issues
[] Add 6-8 more configs with effects
[] Expand traceability
[] Admin panel for polls
[] Check system roles

Season 3: Expansion
[] Basic CSI (global average, no per-category complexity)
[] 20 unlockables (cosmetic or config)
[] Knowledge-based awards (start with 2)
[] Boss challenge (start with 1 type)
[] New categories (Java, AI, etc.)
[] Add new polls
[] Stickers / cosmetics
[] Slackbot
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

[] Config discovery system
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
