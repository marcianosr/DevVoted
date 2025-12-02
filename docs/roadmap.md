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
[x] Balancing

    [x] Threshold formula refinement:   const threshold = round * 150 + (round - 1) * 25;
    [x] Starting storage
    [x] Storage growth over time
    [x] Config costs
    [x] Coverage gain balance

[x] Handle polls answered this run - not sure if this is done correctly
[x] Handle "0.5" effects stacking correctly
[x] Handle Math,random config effect - also show total effect breakdown
[x] Some UI polish so it isn't a mess
[x] Style options better
[x] Style buttons better
[x] Style configs better
[x] Kanto colors
[-] Prematurely updating round/threshold when answering on and still in shop, causing confusion and premature perks (like rerolls) availability
[x] Reset rerolls per gate instead of per poll
[x] Fix "require is not defined" bug before launch
[x] When last win condition is met, show winning screen. Allow user to continue playing or start new run
[x] Start new run button in navigation
[] Add small explanations when starting a new run (e.g., "You start with 1MB storage and need to answer 150 XP worth of polls every 3 polls to continue your run. Buy configs in the shop to help you along the way!")
[] Old-to-new system migration - Make sure questions support markdown in questions (e.g code examples or just code blocks)
[] Github photo?
[x] Show clear disable button in config when storage is full on "purchase"
[x] Shop disable config issue - when buying a config that fills storage, the other configs should be disabled immediately if they can't be bought anymore
[x] Show all time leaderboard
[] Coverage not below zero
[] Total coverage rounding problems
[x] Upgrade packages
[x] Authentication (GitHub)
[x] CI/CD and Deployment
[x] Test daily poll cycle
[] Fix refresh-to-reanswer bug [Critical]
[] Reroll bug: when rerolling it walks behind
[] Check RLS
[x] remove "correct/incorrect"
[x] remove "home" and also from navigation
[] Auth polls list? (in navi)
[x] Show github images
[x] Sentry logging

BUGS:
[x] FORCE DARKMODE [Critical]
[x] Login is white
[x] Page Title
[] When someone waits a day while having the shop open, the next poll comes and is "answered" automatically. Also shop[ is open]
[x] Only update the poll counter when poll is "seen" not when answered
[] Poll status in seperate table - Poll History
[o] History table of polls: What happened with the poll?
[] Append runs with new categories when adding a new category
[x] How to use TOML config?
[x] Slow load db queries
[] Click on config to install
[x] Suspend leaderboards because it slows
[x] Run in leaderboard is wrong: it shows the total runs, not the current run of the user
[o] When a new poll is loaded, the user sees the old poll for a split second causing two track views
[x] Giothub env vs Vercel env?

[x] Trage app - heeft vooral te maken met de database queries die geoptimaliseerd moeten worden
[x] Poll history table - how
[] N+1 query in getActiveRunByUserId - Every page load hits DB twice unnecessarily. Use a join.
[x] Leaderboard query optimization?
[x] Page title is nog steeds "Tanstack blabla"
[] Als iemand de shop open heeft en de volgende dag de pagina weer bezoekt, haal hij de nieuwe poll op maar blijft hij in beantwoorde staat
[] De shop is weg als je de pagina refresht. Niet echt een bug, maar ik weet dat dit zo is
[] Start new Run button in de header werkt niet


### Feedback / BUGS [Critical]

[x] Herzien flow: - start - daily-poll - shop - progress (hub)

- [x] Create activeRunGuard
- [x] Tonen: Hoelang het duurt voor de volgende poll komt
- [x] Tonen: Tijdlijn van welke polls je hebt beantwoord (misschien alleen categorie?) - en de poll van morgen in "?"
- [x] Tonen: Jouw progressie richting de CI gate: Wanneer komt de CI gate?

[] White theme stuff
[] HTML entities komen niet door

    - [] create poll id page to test

[x] eslint/prettier
[x] Update eslint description -> only works with TS and JS
[x] Eslint disabled ander antwoord als je van tab wisselt
[x] When answering on CI check, end run on progress screen. Now it ends when trying to proceed to the shop
[x] Rondes resetten niet als je een nieuwe run start
[x] Gekozen / foute antwoorden onderscheid niet heel duidelijk
[x] Refactor shop in progress page
[x] Score weergave klopt nog niet.
[x] Bij Matthijs zei hij 1.95% en de score was 2%

[] Vote for the next category (poll)
[] "Architecture" catregory toevoegen (pallet)
[-] Fonts niet duidelijk
[] If poll is still open from yesterday, don't allow to answer - I think a simple check isClosed will fix
[x] Fail a run?
[] Mobile text bigger (question)
[] Answers that contain code should be formatted well
[x] When run is over, apparently the poll page is still visible. After answering you suddebnly end on the start page (instead of game-over)
[] When not logged in, the start page shouldn't show the start run button, but a login button
[] UI (?) bug in gates . First poll in run shows "not answered" even when answered
[] Slow ""See your run progress and shop →" button
[] Show a reminder of how to remind for polls in Slack
[] Mobile viewport op /progress pagina isn't responsive
[] Bug in submitting poll larger than 10 selected options
[] Fix button clicking area


### Season 2: Early Meta Layer
[] Admin panel for polls
[] Allow players to suggest polls

[] Introduce moderator role -

    [] Make Piet and Matthijs moderators
    [] Moderators can edit polls
    [] Players can suggest polls, but not edit
    [] Admins can approve/reject suggested polls

[] Expand on low hanging configs
[] Provide KB's when skipping the shop
[] Vue/Angular categorieen - behuizen onder "frontend frameworks" tesamen met React
[x] Loading state for rebuilding new configs
[x] Config: style lint
[x] Game over state
[] Move CI gates into DB
[] Show general site stats (total players, total polls answered, total runs, total configs bought, total polls, total categories, total correct answers, total incorrect answers, total polls for category)
[] Show current season - shows 29 days
[] Show more run info
    [] rerolls used
    [] configs bought
    [] total polls answered
    [] total correct answers
    [] total incorrect answers
    ...etc
[x] Show created by (poll)
[] Allow endless runs
[] Fixen todo warnings eslint
[] Starring a poll
[] Add explanation field to poll (shown after answering)
[] Fix "deflate" config
[] Show partial correct polls in list of progress
[x] Tan stack "start" instead of "query" in footer
[x] Include footer everywhere
[] Config foldout visible everywhere
[] Onboarding/help modal for first-time users [Critical]
[] Colorize tiers coverage
[] Expand CI gate challenges
[] Add icons (pixelated) for configs
[] Events table - Traceability
[] Store "phase" per player in run. This prevents accidental shop miss
[] Streak bonuses (beyond the basic +2 per set)
[] Fix low-hanging sonar issues
[] Needs to be configured in Github aswell - https://github.com/settings/apps/devvoted and Supabase https://supabase.com/dashboard/project/smrkmigjsnhrhwrxobjc/auth/url-configuration
[] Add .editorconfig file

[] Expand traceability
[] Store most and least popular configs

[] Check system roles

Season 3: Expansion
[] Think of a way to have umbrella categories - e.g., "Frontend Frameworks" that contain React, Vue, Angular and sub categories
[] Style category tiers? - red for dangerous low coverage - yellow for low coverage - orange for medium coverage - green for high coverage - gold for max coverage
[] Add Head tags seo
[] Add meta description
[x] Add basic CI/CD github actions (DB migrations)
[] Config discovery system (find new configs based on performance)
[] Basic CSI (global average, no per-category complexity)
[] 20 unlockables (cosmetic or config)
[] Knowledge-based awards (start with 2)
[] Boss challenge (start with 1 type)
[] New categories (Java, AI, etc.)
[] Add new polls
[] Stickers / cosmetics
[] Slackbot
[] Polish flows / UI
[] Change domain name. Not happy with "tamnstack" in my project name



Season 4: Farther away
[] Think of merging HTML/CSS together
[] Think of merging JS/TS together
[] Do the same with backend categorires
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
[] Refactor service files - userSync for example
[x] Run end: Show gameover and stat screen: Allow user to start a new run
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

[] CI / CD github actions (DB migrations)
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


