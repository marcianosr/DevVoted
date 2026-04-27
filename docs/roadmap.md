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

[x] Nalopen alle schermen: zijn ze duidelijk?
[x] Challenges: weghalen tutorial: meerdere opties tonen, maar disabled
[x] Make sure to create a git tag on every release

----- GO LIVE 1.0 -----


BUGS:
[x] correct streak is +1 ahead

### Season 2: Early Meta Layer (v1.0: within network of Kabisa)
- [] Several configs broken:
  - [] yarn.lock - nogt sure, but doesnt lock when installing
  - [] Prefetch - doesn't work
- [] Linkify explanations
- [] Poll difficulty? Possible with amount of answers it has?
- Get coverage based on how much space you have left?
- [] Fix code examples
- [] Gate redesign
  - Win titles (e.g 70% in CSS yields CSS connoisseur)
  - when a player hits 100% total coverage, what happens?
  - Show notification when reaching 100%?
- [] Game over - then on result page it shows configs, but the configs are different on the shop page. When navigating back, the configs are updated agani
- [x] Show indicator of 'gate' test while answering the poll
- [ ] PNPM instead of npm?
- [ ] Score against:
      - Most correct polls overall
      - Most correct polls in category
      - Highest accuracy
      - Highest coverage
      - Most difficult gates passed (gates have difficulty ratings based on how many people pass them)

[x] Make boosters cheaper 256 -> 128
[] See what others answered
[x] Bug: When game-over, first poll should not count in gate
[] Disable acquired config in shop
[] On start run - user not found
[] Build more tension for gates - e.g., "The Git Gatekeeper is approaching... Prepare to answer questions about Git to pass!"
[] Allow the player to choose their paths - specialist vs generalist after each gate
[] Challenge: Afslagen nemen: beginnen als generalist, bij mid game misschien kiezen voor een specialist pad (starfox 64 style?)
- [] Challenge: Specialist pad - hogere gate requirements, maar hogere coverage boosts per correct answer
- [] Challenge: Generalist pad - lagere gate requirements, maar lagere coverage boosts per correct answer
.length aanpassen: Ik dacht dat het alleen statisch aangeeft "er zijn 3 goede antwoorden" bij een vraag
[] Meta progress:
  [] get disk space or free rerolls
  [] get more shop items
  [] Increase droprate of legendary items
  [] Allow players to keep 2 configs after a game over
  [] Increase diskspace shop when skipping
[] Bug: HTML question wasn't showing up in the gate requirements (matthijs, specialist)
[] Out of office timer
[] Game-over flow - atlwast show the question you failed and the correct answer, so you can learn from it
[] Sub cat architecture
  - [] Create sub-categories (e.g., React, Vue, Angular under Frontend Frameworks)
  - [] Replace React with Frontend Frameworks
  - [] Update existing polls to belong to sub-categories
  - [] Make sub categories score for tehir belonging main category (e.g., React polls contribute to Frontend Frameworks coverage)
  - [] CI checks frontend frameworks only
  - [] Display sub-category breakdown on profile and run results pages to maintaince visibility into strengths/weaknesses
  - [] Update configs to target main categories (e.g., Frontend Frameworks) instead of sub-categories
  - [] [brainstorm] COnsider adding .vue, .jsx filetype configs that specifically boost sub-categories with relative more impact
  - [] Keep frontend frameworks category as 2% - the safer option. Consider adding .vue (rarer polls) to increase coveage bonusses.
[] Poll editors should be able edit their own polls
[] When adding a new category, make sure it is appended to the run_cart3egory_coverage table with 0 coverage for all existing runs, otherwise it breaks the app
[x] Shop bug: when 3 items in the shop, and deinstalling one, one of the shop items dissapears because it goes back in the store  (example what if you have a legendary that vanishes)
[x] Eerst bepalen welk type rarity - daarna pas random item kiezen (per slot) getallen van alle rarities (20x common)
  - eerst op basis van de gewichten een random rarity kiezen
  - DAN pas een random item van die rarity kiezen
[] Onboarding: Allow the player to do a "practice run" - answering three polls until a gate.
[] End run "start-run" button not working
[] If player didn't answer polls for 5 days consec. stop the run
[] Get 50KB when answering first, 75KB when first good
[] Use tailwinds "tints" for L1, L2, L3 colors
[] Add more shop items (+2) but they hidden. Also atleast uncommon rarity
[] Out of office - Turn on on profile page. Your run get's paused until you turn it back off. Paused means that you keep your run data, but won't influence with your config decks.
[] Add General Backend configs
[x] Add public config
[] Add private config
[] Config that hides shop items for others
[x] Introduce configs that decrease catefgory weights
[x] Show active config counter
[] Show storage of each other? [brainstorm]
[x] Show deinstall costs
[] Show which configs have impact on your score
[] IndexedDB: show a little counter of storage added compared to the limit
[x] Add "general-backend" category
[] What happens when you have overflow in storage and sell local storage config?
[x] Show "First Good"
[] Show correct/incorrect answers per user (simple circle)
[] Show “back to results” in fixed header
[] Quick profile page - show best stats - https://typehero.dev/@matthijsgroen
[] Show coverage bar on score result page to show impact
[] Show weight probabilty per category (maybe behind a config?)
[] Fix deflate config
[x] Show polls when beyond CI gates in /progress
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
[x] Admin panel for polls
[x] Allow players to suggest polls
[x] Show edit poll link on daily poll for admins
[o] Create more polls also for backend categories
[] Unlocking system
[] Content discovery show on profile
[] Rapid polls
[] Introduce moderator role -

    [] Make Piet and Matthijs moderators
    [] Moderators can edit polls
    [] Players can suggest polls, but not edit
    [] Admins can approve/reject suggested polls


[x] Filter on category in admin panel
[x] Filter by author in admin panel
[] Search by question in admin panel
[x] Show site game stats
[] Add "Architecture" category (pallet)
[] Add "AI" category
[] Basic "share" mechanism - what to share?
[] Challenge toevoegen die rekent met "total" coverage - dus alle categories bij elkaar opgeteld
[] Think about "spaces" - is everything one space or is Codam, EO a separate space like Slack?
[] Early-mid-late game gates. Configs die daar iets mee doen?
[x] Provide KB's when skipping the shop
[] Show a reminder of how to remind for polls in Slack
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
[x] Allow endless runs
[] Fixen todo warnings eslint
[] Starring a poll
[x] Add explanation field to poll (shown after answering)
[x] Fix "deflate" config
[] Leaderboard: show arrow up/down when position changed (delta)
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
[] Sander now has the legendary that equals all category chances. Make sure to allow people to see this is happening
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
[] Open Graph tags for better sharing on social media (see Vercels tool)
[] Add meta description
[] Profile page expansion
[x] Show updated at in footer to show when the last feature has been added
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




