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
[x] Seasons: An excuse to introduce new gameplay mechanics such as point systems, seasonal events, limited-time polls, and exclusive rewards [Critical]
[x] Show XP breakdown [Critical]

[x] Leaderboard [Critical]

    [x] Best total XP overall (highest XP)
    [x] Best in category (highest XP)
    [x] Best streak (highest streak)
    [x] Live run leaderboard
    [] Show who answered today

[x] Create simple linear streak bonus amp
[x] Rarity tiers
[] Create a single "stake" in DB (no UI)

    - [] Timestamps on answer

[x] Create 10-15 configs with effects [Critical]

[x] .js/.css/.ts/.html/.jsx/.git/.package.json- Category amps (+0.5)

[x] localStorage - Extra storag@
[o] try/catch - Safety net for threshold
[x] eslint - Disable wrong option

[x] Make sure configs are additive to each other
[x] Don't rerender shop when installing configs. This shows new options
[x] Remove amp cap
[x] Support markdown in questions (e.g code examples or just code blocks)
[x] show good / wrong answers after answering poll and your current choice
[] Balancing

    [] Threshold formula refinement:   const threshold = round * 150 + (round - 1) * 25;
    [] Starting storage
    [] Storage growth over time
    [] Config costs
    [] Coverage gain balance

[x] Handle polls answered this run - not sure if this is done correctly
[x] Handle "0.5" effects stacking correctly
[x] Handle Math,random config effect - also show total effect breakdown
[x] Some UI polish so it isn't a mess
[x] Style options better
[x] Style buttons better
[x] Style configs better
[x] Kanto colors
[] Prematurely updating round/threshold when answering on and still in shop, causing confusion and premature perks (like rerolls) availability
[x] Reset rerolls per gate instead of per poll
[x] Fix "require is not defined" bug before launch
[x] When last win condition is met, show winning screen. Allow user to continue playing or start new run
[x] Start new run button in navigation
[] Old-to-new system migration - Make sure questions support markdown in questions (e.g code examples or just code blocks)
[x] Show clear disable button in config when storage is full on "purchase"

[] Don't update round/threshold check right away after submission
[] Show current season - shows 29 days
[] Shop disable config issue - when buying a config that fills storage, the other configs should be disabled immediately if they can't be bought anymore
[] Show all time leaderboard
[] Coverage not below zero
[] Total coverage rounding problems
[] Onboarding/help modal for first-time users [Critical]
[x] Upgrade packages
[] Authentication (GitHub/Google)
[] CI/CD and Deployment
[o] Test daily poll cycle
[] Fix refresh-to-reanswer bug [Critical]
[] Reroll bug: when rerolling it walks behind
[] N+1 query in getActiveRunByUserId - Every page load hits DB twice unnecessarily. Use a join.
[] Check RLS
[] remove "correct/incorrect"
[] remove "home" and also from navigation
[] Auth polls list? (in navi)

Season 2: Early Meta Layer
[] Colorize tiers coverage
[] Expand configs
[] Expand CI gate challenges
[] Add icons (pixelated) for configs
[] Make CI gates more like Github
[] Show checks passed
[] Style category tiers? - red for dangerous low coverage - yellow for low coverage - orange for medium coverage - green for high coverage - gold for max coverage
[] Events table - Traceability
[] Store "phase" per player in run. This prevents accidental shop miss
[] Streak bonuses (beyond the basic +2 per set)
[] Fix low-hanging sonar issues

[] Expand traceability
[] Store most and least popular configs
[] Admin panel for polls
[] Check system roles
[] Event framework?

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
