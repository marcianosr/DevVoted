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
    [x] Show who answered today

[x] Create simple linear streak bonus amp
[x] Rarity tiers
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
[x] Old-to-new system migration - Make sure questions support markdown in questions (e.g code examples or just code blocks)
[x] Show clear disable button in config when storage is full on "purchase"
[x] Shop disable config issue - when buying a config that fills storage, the other configs should be disabled immediately if they can't be bought anymore
[x] Show all time leaderboard
[] Coverage not below zero
[x] Upgrade packages
[x] Authentication (GitHub)
[x] CI/CD and Deployment
[x] Test daily poll cycle
[] Check RLS
[x] remove "correct/incorrect"
[x] remove "home" and also from navigation
[x] Show github images
[x] Sentry logging

BUGS:
[x] FORCE DARKMODE [Critical]
[x] Login is white
[x] Page Title
[] When someone waits a day while having the shop open, the next poll comes and is "answered" automatically. Also shop[ is open]
[x] Only update the poll counter when poll is "seen" not when answered
[o] History table of polls: What happened with the poll?
[x] How to use TOML config?
[x] Slow load db queries
[x] Suspend leaderboards because it slows
[x] Run in leaderboard is wrong: it shows the total runs, not the current run of the user
[o] When a new poll is loaded, the user sees the old poll for a split second causing two track views
[x] Github env vs Vercel env?

[x] Trage app - heeft vooral te maken met de database queries die geoptimaliseerd moeten worden
[x] Poll history table - how
[] N+1 query in getActiveRunByUserId - Every page load hits DB twice unnecessarily. Use a join.
[x] Leaderboard query optimization?
[x] Page title is nog steeds "Tanstack blabla"


### Feedback / BUGS [Critical] (Beta test)

[x] Herzien flow: - start - daily-poll - shop - progress (hub)

- [x] Create activeRunGuard
- [x] Tonen: Hoelang het duurt voor de volgende poll komt
- [x] Tonen: Tijdlijn van welke polls je hebt beantwoord (misschien alleen categorie?) - en de poll van morgen in "?"
- [x] Tonen: Jouw progressie richting de CI gate: Wanneer komt de CI gate?

[x] HTML entities komen niet door
[x] eslint/prettier
[x] Update eslint description -> only works with TS and JS
[x] Eslint disabled ander antwoord als je van tab wisselt
[x] When answering on CI check, end run on progress screen. Now it ends when trying to proceed to the shop
[x] Rondes resetten niet als je een nieuwe run start
[x] Gekozen / foute antwoorden onderscheid niet heel duidelijk
[x] Refactor shop in progress page
[x] Score weergave klopt nog niet.
[x] Bij Matthijs zei hij 1.95% en de score was 2%
[-] Fonts niet duidelijk
[-] If poll is still open from yesterday, don't allow to answer - I think a simple check isClosed will fix
[x] Fail a run?
[x] Answers that contain code should be formatted well
[x] When run is over, apparently the poll page is still visible. After answering you suddebnly end on the start page (instead of game-over)
[x] UI (?) bug in gates . First poll in run shows "not answered" even when answered
[x] Slow "See your run progress and shop →" button
[x] Community stats query showing wrong data (7 votes?)
[x] Investigate slow loading times
[x] Remove code box field
[x] Add explanation field to suggest poll page poll (shown after answering)
[x] Link to github issues for bug reports


**Game play**
[x] Weights aren't working on production
[x] Responsive leaderboard issue
[x] Show shop preview on /results
[x]  Detailed storage breakdown in shop
[x] More challenges - remove tutorial challenge
[x] Include correct polls in leaderboard
[x] Show which challenge is active
[x] Cap at 100% - how to do this best? What happens when someone reaches 100% coverage in a category?
  [x] Implement levels for coverages: to 0% and upgrade tier (L2). Edge case: shoudln't impact gate checks
[x] Answers you missed are hard to see
[x] Show CI gate in leaderboard
[x] Rebuild Telemetry config
[x] Decide next category on next poll based on configs
[x] Consider increasing penalty by round
[x] Half the price of uninstalling, adding "junk" to storage [idea]
[x] Make gates harder - they are too simple
[o] More leaderboard variants
  [x] also show current gate
  [] - All-time leaderboard (best runs)
  [] - Show all category specific leaderboards
[o] Expand on low hanging configs
[x] Make sure the rules on start screen is clear
[] Consider poll rating: very easy to very hard [brainstorm]
[] Show gate status good/failed based on polls answers on /progress [brainstorm]
[] Loading states - some stuff takes too long
[x] Add clarifying labels to the coverage breakdown
[] Add a one-time shop tutorial tooltip
   First time visiting shop: "Welcome to the Package Manager! You have 1 MB of storage to install configs. Each config uses storage and boosts your coverage. Choose wisely!"
[x] Add a mini status bar to the poll page
  ┌─────────────────────────────────────────┐
  │ 🎯 Gate #1: Need 2% in any category     │
  │ Git: 1.3% ████░░░░░░ | Streak: ⚡1      │
  └─────────────────────────────────────────┘
[x] More community stats

    [x] Who voted on the poll of today?
    [x] First to answer
    [x] Fastest to answer
    [] Correct/incorrect for each user
    [] Users not answered who are in a run


**Mobile responsiviness**
[x] Sticky button "See your run progress and shop →" (mobile atleast)
[x] Mobile text bigger (question)
[x] Responsiveness in general (see matthijs' feedback)

**Anayltics**
[] Config purchase analytics

**Maintainability**
[] Add e2e test for core flow
[x] Upgrades of packages

**Bugs**
[x] Multiple choice responses are bugged: i answered 7 times
[x] Remove “0” in shop
[x] Remove extra minus
[x] Show indetermined state on multiple choice
[] Mini header issues:
  [] Doesn't show the correct categories? (check gate 7)
  [] x is shown even when requirements are met in mini header
[o] Poll header showing countdown of next poll not in sync. Make sure the poll is changing at 0:00
[x] Active configs are small on desktop
[] Wrong score is still reflected in score breakdown and leaderboard
[] Update poll with "month" answer
[x] Shop changes when selling/installing configs (shouldn't)
[x] Shop resets when uninstalling a config
[x] Local storage config adds insane amounts of storage when skipping shop
[x] Show new shop items every new poll/day
[x] Fix text encoding issues in options (e.g +, -, <, >, etc)
[x] Edit poll page research: doesn't save changes and somehow "fucked" up the poll and response id [Critical]
[x] Bug in submitting poll larger than 10 selected options
[x] Fix button clicking area
[x] When not logged in, the start page shouldn't show the start run button, but a login button
[x] Remove login input fields on production
[] When answering a question poll, and the game is over:
  - [] the start run button doesn't work anymore
  - [] Should show also the gate you ended in the run summary
  - [] Somehow the time of answering is weirded: it says -2min and -37 sec?
  - [] I answered it twice for some reason
  - [] you should be allowed to reanswer
  - [] check: progress page says you dindt answer the last poll, but you did
[] Update explanation for todays poll with Matthijs thought pattern of Object.values
[] Codeblocks are sometimes still white in dark mode
[] Handle poll status "open" - not used as indicaor that the poll is open anymore
[] Date of opened poll isn't right

[] Nalopen alle schermen: zijn ze duidelijk?
[x] Challenges: weghalen tutorial: meerdere opties tonen, maar disabled
[] Make sure to create a git tag on every release

----- GO LIVE 1.0 -----


BUGS:
[] correct streak is +1 ahead

### Season 2: Early Meta Layer (v1.0: within network of Kabisa)
[] Show correct/incorrect answers per user (simple circle)
[] Show “back to results” in fixed header
[] Quick profile page - show best stats
[] Show coverage bar on score result page to show impact
[] Show weight probabilty per category (maybe behind a config?)
[] Show polls when beyond CI gates in /progress
[] Create "groups" - e.g., Kabisa, Codam, EO, Open Source Contributors, etc
        Option A: Separate categories (current behavior)
        React:     ████████░░ 80%
        Vue:       ██░░░░░░░░ 20%
        Angular:   ░░░░░░░░░░ 0%
        ───────────────────────
        CI Gate: Need 30% in 2 categories ❌ (only React qualifies)
        - Each framework = its own coverage
        - Rewards deep expertise
        - Can be punishing if you only know React but get Vue/Angular polls

        ---
        Option B: Grouped coverage
        Frontend Frameworks: ████████░░ 33% (average of React+Vue+Angular)
        ───────────────────────
        CI Gate: Need 30% in Frontend Frameworks ✅
        - All framework polls contribute to one score
        - More forgiving - React strength compensates Vue weakness
        - Simpler mental model

        ---
        Option C: Hybrid (track both)
        Frontend Frameworks: 33% overall
          └─ React:   80%
          └─ Vue:     20%
          └─ Angular: 0%
        ───────────────────────
        CI Gate uses GROUP score (33%)
        Leaderboard shows INDIVIDUAL breakdown
        - Best of both: forgiving gates, detailed stats
        - More complex to implement
[] Currently in tooltip: show your response time  - how long did it take to answer
[x] Admin panel for polls
[x] Allow players to suggest polls
[x] Show edit poll link on daily poll for admins
[] Create more polls also for backend categories
[] Unlocking system
[] Content discovery show on profile
[] Rapid polls
[] Introduce moderator role -

    [] Make Piet and Matthijs moderators
    [] Moderators can edit polls
    [] Players can suggest polls, but not edit
    [] Admins can approve/reject suggested polls


[] Filter on category in admin panel
[] Filter by author in admin panel
[] Search by question in admin panel
[] Add "Architecture" category (pallet)
[] Add "AI" category
[] Basic "share" mechanism - what to share?
[] Think about "spaces" - is everything one space or is Codam, EO a separate space like Slack?
[x] Provide KB's when skipping the shop
[] Show a reminder of how to remind for polls in Slack
[] Mobile viewport op /progress pagina isn't responsive
[] Think of daily-poll table: This will grow massively. Imagine 5 years from now how 365 * 5?
[x] Loading state for rebuilding new configs
[x] Config: style lint
[x] Game over state
[] Move CI gates into DB
[] Show general site stats (total players, total polls answered, total runs, total configs bought, total polls, total categories, total correct answers, total incorrect answers, total polls for category)
[] Show current season - shows 29 days
[] Cache daily poll to increase performance
[] Show more run info on progress page
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
[x] Add explanation field to poll (shown after answering)
[] Fix "deflate" config
[] Leaderboard: show arrow up/down when position changed
[] Show partial correct polls in list of progress
[x] Tan stack "start" instead of "query" in footer
[x] Include footer everywhere
[] Wrap Sentry for production only
[] Config foldout visible everywhere
[] Onboarding/help modal for first-time users
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
[] CI / CD github actions (DB migrations)



### Season 3: Expansion
[] Think of a way to have umbrella categories - e.g., "Frontend Frameworks" that contain React, Vue, Angular and sub categories
        Option A: Separate categories (current behavior)
        React:     ████████░░ 80%
        Vue:       ██░░░░░░░░ 20%
        Angular:   ░░░░░░░░░░ 0%
        ───────────────────────
        CI Gate: Need 30% in 2 categories ❌ (only React qualifies)
        - Each framework = its own coverage
        - Rewards deep expertise
        - Can be punishing if you only know React but get Vue/Angular polls

        ---
        Option B: Grouped coverage
        Frontend Frameworks: ████████░░ 33% (average of React+Vue+Angular)
        ───────────────────────
        CI Gate: Need 30% in Frontend Frameworks ✅
        - All framework polls contribute to one score
        - More forgiving - React strength compensates Vue weakness
        - Simpler mental model

        ---
        Option C: Hybrid (track both)
        Frontend Frameworks: 33% overall
          └─ React:   80%
          └─ Vue:     20%
          └─ Angular: 0%
        ───────────────────────
        CI Gate uses GROUP score (33%)
        Leaderboard shows INDIVIDUAL breakdown
        - Best of both: forgiving gates, detailed stats
        - More complex to implement
[] Style category tiers? - red for dangerous low coverage - yellow for low coverage - orange for medium coverage - green for high coverage - gold for max coverage
[] Introduce new polls types: Guessers and puzzle grids
[] Add Head tags seo
[] Add meta description
[] Profile page expansion
[x] Add basic CI/CD github actions (DB migrations)
[] Config discovery system (find new configs based on performance)
[] 20 unlockables (cosmetic or config)
[] Knowledge-based awards (start with 2)
[] Boss challenge (start with 1 type)
[] Stickers / cosmetics
[] Slackbot
[] Polish flows / UI
[] Change domain name. Not happy with "tamnstack" in my project name
[] Implement at least 2 knowledge-based awards (e.g., CSS Connoisseur, Markup Master)
[] Trigger & resolve at least 1 boss challenge condition (e.g., "The Enigma")
[] AI design soms stickers
[] Add new polls (currently Slack'ed to myself)
[] Introduce new categories: Java, AI (Talk with Guido if possible)


Season 4: Farther away
[] Think of merging HTML/CSS together
[] Think of merging JS/TS together
[] Do the same with backend categories




