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
[] Show XP breakdown [Critical]

[x] Leaderboard [Critical]

    [x] Best total XP overall (highest XP)
    [x] Best in category (highest XP)
    [x] Best streak (highest streak)
    [x] Live run leaderboard
    [] Show who answered today

[x] Create simple linear streak bonus amp
[] Rarity tiers
[] Create a single "stake" in DB (no UI)

    - [] Timestamps on answer

[o] Create 1-15 configs with effects [Critical]

[x] .js/.css/.ts/.html/.jsx/.git/.package.json- Category amps (+0.5)

[x] localStorage - Extra storage
[x] try/catch - Safety net for threshold
[x] eslint - Disable wrong option
[] prettierrc - Round XP up
[] async/await - no amp on polls but extra on sets

[x] Make sure configs are additive to each other
[] Don't rerender shop when installing configs. This shows new options
[] Balancing

    [] Threshold formula refinement:   const threshold = round * 150 + (round - 1) * 25;
    [] Starting storage
    [] Storage growth over time
    [] Config costs
    [] XP gain balance

[] Traceability
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
[] Check RLS

🔥 Show-stoppers (Fix TODAY)

1. Hardcoded date in daily-poll.tsx:54 - Your daily polls are frozen on October 30, 2025. This breaks the core game mechanic.
2. No poll data - Database has schema but likely no actual quiz questions. Game literally can't run without content.
3. Environment variables in git - Your .env with SONAR_TOKEN is committed. Security red flag.

💀 Will bite you on launch day

4. Zero database indexes - Once you get users, queries on polls.category_code, runs.user_id, and poll_responses will crawl. Add indexes NOW on frequently queried columns.
5. N+1 query in getActiveRunByUserId - Every page load hits DB twice unnecessarily. Use a join.
6. Missing roadmap.md - You reference it everywhere but it doesn't exist. Either create it or remove references.

🤔 Won't kill you but will annoy users

7. Generic auth errors - When login fails, users get nothing helpful. Add actual error messages.
8. TODO comments in core handlers - Line 73 in polls/handlers.ts says "TODO: The start of posting to the DB". Is answer submission even implemented?

The architecture is solid. Your problem isn't code quality - it's incomplete implementation and configuration issues. Fix items 1-6 and you can ship.

Season 2: Early Meta Layer
[] Very basic CSI: (correct / total) × streak)
[] Store "phase" per player in run. This prevents accidental shop miss
[] Streak bonuses (beyond the basic +2 per set)
[] Fix low-hanging sonar issues
[] Add 6-8 more configs with effects
[] Expand traceability
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
