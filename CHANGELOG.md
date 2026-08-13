# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
- **Every config now asks you for something, and the linters ask for the right thing**: a build used to be able to owe the gate nothing at all. ESLint and Stylelint only bound if you paid to use them, and AGENTS.md carried no demand whatsoever, so a pipeline of those three had an empty checklist and cleared every gate without answering a single poll correctly, all the way to the summit with all 13 swatches. Two things change. **The linters now ask for competence instead of proof of purchase**: ESLint wants one JS or TS poll right if either turns up, Stylelint wants one CSS poll right if CSS turns up. Exactly like a Focus config, and excused only by a draw that never showed you the category. Using the effect stays entirely optional, because a demand you can't afford is a death you never chose: lint a poll and get it wrong and you're out the fee, nothing more. **AGENTS.md now asks for one correct answer**, unconditionally, never excused by the draw. A legendary's 256KB price is most of what it costs, so its demand is light, but light isn't free. One honest gap remains: if none of your configs' categories are drawn all window, every demand is excused and the gate asks nothing. That's the rule working as intended, and you can't plan around a draw you don't choose.
- **Drop a config on the doorstep**: the pipeline listed on the gate-prep page is now live. Click a config and it offers to drop it — the slot frees up, but nothing comes back, so while the shop is still open behind you the panel points you at **Uninstall** there instead, where the same config pays a refund. It exists for the build you only realise is wrong after you've left the shop: a check you can't meet is a gate you lose, and shedding it costs less than failing with it. Dropping is refused at the coming gate's width demand, naming the count it would sink you under, and refused outright for your last config.
- **The old game is retired**: the pre-2.0 pages that lived under `/old` — the calendar daily poll, its shop, community board and game-over screens — are gone, along with the screens only they used. Everything they did lives on in the daily run at `/run`. The reveal's score chips also traded the stock green/red for the game's own palette on the way out.
- **Unit Tests asks for exactly what you bought**: its correct-answer demand no longer creeps up as you climb. An un-upgraded Unit Tests wants 1 correct answer in the window at gate 0 and still wants 1 at the summit; buying L2 makes it 2, L3 makes it 3, and that is the only thing that ever moves it. Previously the demand rose by one every second gate on its own (up to +3), which meant the same config on the same screen quietly asked for more each visit — and since a level is what raises a demand everywhere else in the game, it read as though the config had upgraded itself. It never had. What still gets harder as you climb is the price of failing: a lost gate strips more configs the deeper you are, and the gates keep demanding a wider pipeline. The difficulty now comes from what a fail costs you, not from a number changing behind your back.
- **Storage plans now climb to 3MB, and the deep ones open as you do**: the ladder runs 512KB (free), 640KB, 768KB, 1MB, 1.5MB, 2MB, 3MB, billed 0 / 8 / 16 / 32 / 48 / 72 / 112KB every closed window. The bigger caps only go on sale deeper in the climb — 768KB after gate 2, then one more rung every second gate up to 3MB after gate 10 — because a cap is only worth its bill once a gate pays enough to fill it, and a 3MB subscription bought on day one is just a charge you can't cover. The shop shows the rungs you've reached plus the next one greyed out, so you can see where the ladder goes ("Opens after gate 4"). Rows now read `640KB · 8KB / gate`, with the big caps written in MB. Careful up there: an unpaid bill still drops you to the free tier, and on a 3MB plan that burns everything above 512KB.
- **Buying in the shop now takes two taps, and the first one only opens the card**: hovering an offer just whispers "Click to install"; clicking it opens the offer's card — its rarity, what it does, a green **install** button and, once holds unlock, a **Lock config** button — and a click anywhere else closes it again. Installing settles the offer into **✓ owned**, staying on the table so you can see what you took. Selecting costs nothing and you can change your mind as often as you like, so the only press that spends storage is a button inside a card you deliberately opened. Previously the chip itself bought the config the instant you touched it, which on a phone meant a mistimed thumb could spend 384KB with no way back. Offers you can't afford (or have no free slot for) stay tappable so you can still read them; press the greyed-out **install** and it tells you what's in the way ("No free slot — uninstall a config first", "Costs 128KB — you have 8KB").
- **The shop lets you steer what it offers**: alongside **Rebuild offers**, which still swaps the whole table for a fresh set at a doubling price, two new controls arrive as you climb. **Lock config**, on each offer's card beside install, **holds** that config for 16KB: rebuilds skip it, it is still waiting for you at the next gate's shop, and the held offer wears a small padlock in its corner — so a config you can't afford yet is something you can put a deposit on instead of losing. You get one hold at a time, and installing the config is what spends it — leave it unclaimed and it keeps taking up a spot on the table. **Extend offers** buys a sixth config on the table for 48KB, and it stays for every shop after it (a second extension makes seven). The three prices buy three different lengths of time on purpose: a rebuild lasts this visit, a hold reaches the next gate, an extension lasts the rest of the run. They arrive one at a time rather than all at once — rebuilding from your first shop, holding from gate 2, extending from gate 3 — so the shop grows as you do.
- **Volkswagen CI, the legendary that cheats the gate**: a 384KB legendary that reports one failing check as passing, so a gate you should have lost goes green. It only works when at least 3 of your other checks actually ran and passed — a test that was skipped proves nothing, so padding your pipeline with Focus configs for categories that never turn up buys you no cover. That floor is a width demand in disguise: covering takes 3 passing rows plus the row it hides, so the fraud doesn't work below slot 5, and going wider gives you more rows that can fail together and take the cover away again. Two failures at once and it hides neither. The gate report never hides the fraud from you: the faked row keeps its real tally and is marked "reported passing", and Volkswagen CI's own row names what it covered ("hid Coverage").
- **The Build Summary shows what a correct answer is worth**: a new "Per answer" line reports the coverage and storage a single correct answer pays right now, before you've answered a poll — and calls out the extra coverage a Focus config adds when its category actually comes up ("×1.25 with a matching config"). Hovering a bench config or shop offer updates the line the same way the clear reward already does, so you can see exactly what adding it would change. The clear reward's own coverage figure now reads "×2 coverage this gate" instead of a bare "×2", so it can't be mistaken for a KB or reward multiplier.
- **After the shop, the prep page is home base**: leaving the shop now lands you on the gate-prep page instead of pushing you to the community board, and the shop stays open behind it — bounce shop ↔ prep ↔ community as long as you like, because the climb only resumes when you press **Start gate** on prep. That's also where leftover storage above your cap finally burns, so a detour to the community board no longer costs you your overflow. When today's polls are spent, the start button itself wears the countdown ("New polls in 7h 23m") while the shop and community stay a click away — so the wait is now time you spend tuning your build. The stake's "To start" line carries its own little **← Back to shop** shortcut, so the demand it names and the place you meet it sit on the same row.
- **Deep gates demand a real build**: each gate now admits only a pipeline wide enough to survive its own stake — nothing at the first gate, then 1, 2, 3 configs at Boulder, Cascade and Thunder, climbing to 8 at the summit — so you can no longer sell down to one easy config and cruise past every check. The early gates stay light on purpose: farm them, rebuild there after a rough strip. The shop and gate-prep screens refuse to sell or drop below the coming gate's demand, the Build Summary names it in red with the exact count to install once you're under it, and the shop's exit simply stays locked until you've repaired the width — a strip can leave you under the demand for the retry, but you shop your way back over it before the next gate, never into a surprise death. If the run truly can't afford the repair, the exit turns red and says so — **End run** is then your click to make, not the gate's. Trimming your pipeline mid-window is gone too: the gate judges the build it let in.
- **Start your run with one pick**: run setup now offers three starter stacks, each its own card — **React** (.js/.jsx, "Fast but risky"), **TypeScript** (.js/.ts/ESLint, "Safer JS/TS focus," marked **Recommended** for your first run) and **Full stack** (.vue/.java/.git, "Balanced across categories") — named for what's actually inside and tuned so none of them is a hidden hard mode. Picking one expands its card into a compact preview — every config's demand and payoff on one line each — with a linter's escalating fee (and anything else beyond the headline mechanic) waiting behind its own "more details" tap, so a three-config stack doesn't read like a rules document. Prefer full control? A dashed **Customize all 3 slots →** card opens the classic bench ("← Back to stacks" brings you back) — free drafting from the whole roster, not just the curated three. The Build Summary beside it now reads as one flowing sequence — polls → clear reward → fail consequence — instead of separate boxed sections, and drops "0/1" counters before you've actually played a poll.
- **Clearing a gate now pays out instead of reporting**: the gate-clear screen is one big number — "+64KB storage" — with the gate's name above it, one line telling you what storage is for, and a **Spend it → the shop** button that takes you straight to where you can. The per-config breakdown, meters and climb ladder are gone from the clear; the failed-gate screen keeps its full report, because that's where you need to know what fell short. Your storage bill (and any downgrade) still shows up here — that's news, not noise.
- **Storage capacity is now a subscription**: every run starts on the free 512 KB plan, and the shop offers bigger ones — 640 KB for 8 KB a gate, or 768 KB for 16. The bill lands every time a window closes, win or lose: a failed gate pays you nothing and still charges you. Can't cover the bill? You drop straight back to the free plan, the way any cloud provider would handle it. Downgrading yourself is free but immediate — anything sitting above the smaller cap burns on the spot, and the button warns you exactly how much before you press it. The gate-prep screen lists the bill next to the gate's stake ("pass or fail"), and the reward and repair screens show the receipt.
- **A fail you cannot pay for ends the run**: a failed gate peels configs, and from around gate 4 the peel wants more configs than a lean pipeline holds. That now ends the run right there, instead of emptying your pipeline and sending you into five more polls you had no way of clearing. The pipeline header has been warning you all along ("a fail peels all 3, run over"); now it is the truth. Your last config also stopped being for sale in the shop, so a run only ever ends at a gate it failed.
- **The day's standouts open the page, and there are nine of them**: the community board now leads with **Standouts today** instead of burying it under the polls, in two columns — how today went on the left, where the climb stands on the right. Four are new and read your *run* rather than your answers, across everyone still climbing: **deepest gate** (with that gate's badge beside its name), **longest streak** (the best run of correct answers a run has managed, not the one it happens to be riding — a single miss no longer wipes it), **most coverage**, and **widest pipeline**. Two more read the day: **first good**, for the first answer that was actually right rather than merely first, and **only one right**, which names the poll exactly one player cracked and the player who cracked it — only ever a poll you have already met, so nothing ahead of you is spoiled. Your haul still sits beside the heading ("you took 3 of 9"), an award nobody has earned stays off the board rather than showing blank, and the winner is still the avatar, named on hover.
- **See where everyone is on the climb**: the community page opens with **The climb today**, the whole gate ladder on one line with every player currently climbing standing on it, placed by which gate they're in and how far into its five polls they've got. Each gate's swatch sits on the track at the point that gate starts, numbered and named underneath ("6 Soul"), so the badges you're collecting *are* the map. Yours is the ringed avatar marked "you"; climbers on the same poll stack up behind a "+2". A faded, dashed avatar marks the deepest you have ever got in a finished run. Everything past your own furthest point sits behind a dashed edge marked **uncharted** — hatched while it's a narrow band, bare once it's most of the track — so someone standing beyond it is standing somewhere you have never been. Below the line sit the players a gate killed today, dimmed out at the spot where they fell; hover one for whose it was. Above the line you're still climbing, below it you're out. Walking away from a run leaves no mark, because that isn't falling. All 13 gates fit on a desktop, so the summit is visible from gate 0; a phone narrows to three gates around you with plain arrows either side.
- **The answer review reads like a failing test**: open a question on "Review your answers" and you now get **Expected** over **Received**, each option tagged with the letter it wore in the question (A, B, C…), so the gap between the right answer and yours is one glance instead of a hunt down a list. The right answer reads green; yours reads red when it was wrong and amber when it was only half right, which means the two rows share a colour only when you nailed it. Multi-answer polls close with what you caught and the letters you didn't ("1 of 2, you missed C"). Every option neither side touched folds away behind "7 other options", so a nine-option question no longer fills the screen with things nobody chose. Questions you got right arrive folded and dimmed while the ones you fumbled arrive open, since those are the reason you came, and the PASS/PART/FAIL badges are outlined here so a column of them stays quieter than the answers underneath.
- **The gate's payout reads as three meters**: storage, coverage and the climb now report the same way — where the run stands ("96KB storage"), what this gate added ("+64KB this gate"), a bar, and what the bar is filling toward. Storage fills toward the 512KB cap. Coverage's meter is the slot it is buying — the same dashed unlock row the shop draws, with the rung's price, how far you've come, and a **locked** / **unlocked** pill — so the reward screen answers "did that open a slot" without a trip to the shop. When a gate's coverage is what carried you over the rung, a green line under it says so: "slot 4 opened this gate". The badge line counts the collection ("earned · 2 of 13") and sits over the gate ladder, so the pip you just filled is visible and the caption names where you're going ("gate 2 of 12 · next up: Cascade gate"). The coverage split moved below its own rule as a ranked two-column list, biggest earner first, instead of a row of same-size chips. At the slot cap the coverage bar drops rather than filling toward nothing.
- **The HUD shows how the window is going, not just how far in you are**: the "3 / 5 polls" counter is now a dash per poll — green for a correct answer, amber for a partial, red for a miss, grey for the polls still to come. The gate judges the whole window, so two reds by poll 3 is a completely different day from two greens, and the old counter read identically in both.
- **A failed gate wears its badge too**: the gate-failed headline now carries the gate's swatch beside the red FAIL, the same mark a clear shows. It says which gate this was, not what you walked away with — the headline already names it ("Pallet gate failed!"), so it should look like the Pallet gate.
- **The climb wears its gate, not the question's category**: the whole app — background tint, HUD, question card, buttons — now takes the color of the badge you're currently fighting for: pale Pallet on gate 0, Boulder's pewter on gate 1, and so on up the Kanto map, instead of flipping color with every poll's category. Two summit touches keep things readable: the Elite gate glows a lightened indigo (its badge stays true indigo), and the Champion gate wears fuchsia while its badge keeps the legendary gradient. Categories carry no color at all anymore — they name themselves in plain text on the question, the community board, and the Dex — so a color on screen always means one thing: how deep you are. Gate-cleared green and gate-failed red still take over on their screens.
- **The answering screen's pipeline shows only what's live**: while you're on a question, the pipeline beside it folds every row shut except the check the gate is currently judging (the amber one). The rest read as one line each and open on a tap, so three configs no longer push the question off the screen. Every other pipeline surface (run setup, gate report, shop) is unchanged: there the list *is* the screen, and why a row passed or failed is what you came to read.
- **The review carries the code**: a poll's snippet now sits inside its row on the answer review, above the assertions. Half the questions ("which of these is not valid?", "what does this output?") mean nothing without it, so reviewing them meant remembering the code from the answering screen. Polls you answered before this update won't show one; polls from here on will.
- **A failed gate reads its answers on its own page**: the repair screen now shows only the broken build and the configs you can peel, and hands off with **Review answers →** once you've paid the quota. The five questions moved to the same review page a cleared gate uses, which is also where the failed run picks the climb back up ("Community →"). Choosing what to sacrifice and studying what you got wrong are two different jobs, and they were sharing one scroll.
- **Gates count from 0, and the summit is gate 12**: a run opens on **gate 0** and ends on **gate 12** — thirteen gates in all. You start at zero and work toward one, the way a counter should read, so your first day is "gate 0" and a first-gate break reads "Gate 0 — pipeline broke here".
- **Clearing a gate is all it takes to climb**: passing your pipeline's checks advances the gate, full stop. Widening the pipeline no longer opens gates, so you can be five gates deep on your starting three slots if your build keeps holding — and there is no more "cleared, but still gate 3" screen waiting when coverage lags. What stops you is the gates getting harder, not a locked slot.
- **Slots are width, and only width**: coverage still unlocks them on the same ladder, and they still cost no storage — they buy room for another config. The shop's unlock row now says just that: "Opens at 8% coverage · 0% reached" and a live bar. Cross the line and it opens itself, no button to press — the shop marks the slot you just gained with a green "Unlocked 4th slot" row instead.
- **Collect the badges: every gate you clear is a swatch**: thirteen of them, one per gate, and beating the gate is what earns it — the way a gym badge should work. Gate 0 is the **Pallet Swatch**, where every journey starts, and the summit pair close it out: the **Elite Swatch** at Indigo Plateau, then the **Champion Swatch** above it. In between you climb the eight gen-1 gym badges in the order the trainer card lists them (Boulder, Cascade, Thunder, Rainbow, Soul, Marsh, Volcano, Earth), with the two Kanto spots that never had a gym waiting where you actually walk into them: **Lavender** at gate 4, straight out of Rock Tunnel, and **Seafoam** at gate 8, on the way to Cinnabar. Each wears its home town's colour; the Champion alone wears the legendary gradient. The gate-cleared screen names the badge you just won in its own colour, and they're yours forever across every run — see them on your run setup stats, the end-of-run summary, and the **Swatches** tab in the Dex where the ones you haven't earned stay hidden behind "???".
- **Every gate pip tells its own story**: the climb's bar is a row of chunky pips, one per gate, each in the colour of the badge that gate awards — so the bar *is* your collection. Gates behind you read solid, the gate you're running fills as you answer its five polls and wears a pale outline so you can always find where you are standing, and the rest sit dimmed ahead. Hover or tap a pip and it names that gate's badge and where you stand: "gate 3 · Thunder Swatch · Running now · 3 of 5 answered". The caption above the bar names the gate you're currently in ("Boulder gate · 1 / 12") in that gate's own colour, so the HUD calls it what the shop, the reward screen and the swatch you're climbing for all call it.
- **The gate tells you what a mistake costs**: the pipeline header now names the stake inline — "a fail peels 3" — and turns red when a failed gate would take your whole build, which from around gate 4 it will if you are running lean. Deep gates peel more configs than shallow ones, so a narrow pipeline goes from risky to sudden-death without warning; now there is one.
- **The shop stops pretending**: hovering an offer you can't buy no longer draws it into your pipeline. Previously a config you couldn't afford, or had no free slot for, still appeared as a ghost row in a slot that didn't exist yet, which read as if it had been installed. Now only offers you can actually install preview, and the chip's own price tag and tooltip say why the others can't. Those price tags are also smaller and the offer row has room to breathe, so a tag no longer lands on the next config's name.
- **Pipeline slots are numbered**: the load-out list counts down its slots in the margin — 1, 2, 3 — including the empty ones and the locked rung at the bottom, so "slot 4" on the unlock row is visibly the fourth slot. Each row's detail now hangs off its status mark instead of its config chip, giving the list one clean thread down the left, and the rarity word is gone from the rows (the chip's border already says it). Hovering a bench config no longer prints "click to add" inside your pipeline — the previewed row is the button, and saying so mid-pipeline read as if the config were already installed.
- **Storage reads as free space**: the HUD leads with what you have left to spend — a big "328 KB free" over a bar of what's committed, with "184KB of 512KB used" underneath — because headroom is what you budget against in the shop, and anything earned past the 512KB cap is discarded. Every storage number carries its KB, so no figure on screen is a count of something unnamed. (The old help text still claimed a 1 MB cap; it doesn't.)
- **Your build is the whole checklist**: gates no longer carry a built-in correct-answer demand — only your configs' checks judge you, with Unit Tests owning the escalating correct-count. In exchange, a cleared gate pays by how deep you are and how well you answered: 32 KB × the gate number, scaled by your correct answers — gate 1 tops out at 32 KB, gate 5 at 160, growth stops at gate 12, and a 0-correct clear pays nothing. A pipeline with nothing installed has no checks to pass, so it can never clear a gate, which is why losing your whole build now ends the run.
- **The wait wears a clock**: the community board keeps a countdown to tomorrow's polls in its footer ("New polls in 7h 23m") on every visit, not only the ones that find you stuck. When your run *is* locked for the day, "Back to your run →" greys out beside it and says why on hover; both come back to life once the new day starts.
- **A full pipeline rests the bench**: once every slot is filled, the remaining starter configs dim and stop responding until you free a slot — no more silent, dead-feeling chips.
- **The main action wears the screen's color**: the primary button (submit answer, next, continue) follows the screen's theme — the current gate's color during the climb. Config chip labels read white everywhere, leaving the border and tint to carry the rarity color.
- **Try a config before you slot it**: on the run setup screen, hovering a bench config previews it as a would-be row in your pipeline's next open slot — boxed in a dashed border in its rarity color, like the empty slots it stands in for; "click to add" seals it — and the stat strip underneath shows exactly what it would change, old → new (say coverage ×1 → ×2). Multipliers still at ×1 read dim so the stats that actually move are the ones that glow, and a color key under the bench names the four rarities.
- **Pipeline rows tell their story and fold away**: on every pipeline surface (run setup, answering, gate report, shop load-out) each config is one line — a state mark (an amber dot while its check runs, a green ✓ passed, a red ✗ failed, gray dormant — checkless configs too, their value slot reading "passive"; an idle linter sits gray until used, its "use" button being the invitation), the config's chip — the same rarity-bordered chip you draft and slot — and its live counter on the right. Under it, open by default, sits the config's story in plain sentences: the demand first ("Gain coverage in 2 categories"), then the payoff ("Then all coverage earns **×1.5**" — the numbers glow), a linter's fee in red, and the rarity. Tap the chip to fold a row to its one-liner and tap again to reopen; the same view fits desktop and mobile. Code Coverage's row no longer prints "steady" while your streak is clean — no news is good news. The linter acts from its own row: its "use 8KB" button replaces the poll card's old "Run linter" button. The answering screen's pipeline section is headed "Your pipeline" with the slots counted underneath, the same heading the run setup screen uses; the poll's category header is smaller, and the colored line under it is gone. The shop's chips stay as the click-to-sell/upgrade target in their row; only the answer review keeps its boxed badges.
- **Legendaries wear a still ring**: legendary configs now carry a static Kanto-gradient border (saffron → fuchsia → lavender → cerulean → celadon) instead of the color-cycling animation, and their rarity word reads a steady fuchsia.
- **The shop speaks in rows and buttons**: the shop's offers list like pipeline rows — a ＋ mark, the config's chip, its demand/payoff story, and a green **Install 32KB** button on the right; an offer you can't afford dims and reads "need 128KB" instead. Your load-out rows carry their verbs the same way: an **Upgrade** button — shown only when the config can actually level — that wears the legendary prismatic ring the moment its coverage requirement is met, and **Deinstall** with its refund; no more hidden sell/upgrade popover behind the chip. Hovering **Upgrade** previews exactly what the next level does ("L2: JavaScript polls earn 1.5× coverage — but if JavaScript shows, you must get 2 right."); while the upgrade is still gated, the tooltip adds the coverage it wants, naming its category in that category's color. And an upgraded config's row keeps up: its demand and payoff lines read the new level's numbers ("Get 2 JavaScript polls right" · "Then JavaScript polls earn ×1.5 coverage"). With a full pipeline the buy buttons park and their tooltip says how to make room; "Rebuild configs" is now "Reroll offers" (same fee), and the shop's continue button names its destination: "Continue to gate 2 →".
- **The next slot shows its unlock price**: the run setup pipeline now lists the next slot as a locked dashed segment — "Slot 4 · unlocks at **11%** coverage · you have **6.5%**" with a live progress bar — so the path to a wider build stays visible while you pick configs. Once your coverage clears the gate it opens on its own — no separate step in the shop.
- **The reward screen shows what you won**: the cleared gate's totals now read as winnings — "you won **+80KB** storage · **+9.9%** coverage" — over a storage bar drawn like the HUD's: the muted stretch is where your storage stood before the gate, the green segment is what you just added, on its way to the 512KB cap. Coverage badges line up every category this gate's polls came from ("CSS +1.3%", "JavaScript +1.1%", …). And your answers sit right on the screen: one tight row per question with its PASS/PART/FAIL badge and the coverage it earned, folding open to the choices on a tap — the "Review answers →" button is gone.
- **A clearer run setup screen**: all offered configs now sit in a single list beside your pipeline — no more separate steps. The pipeline shows how many slots you've filled, and the gate reward, multipliers, and failure penalty read as one compact line of stats underneath your picks.
- **Build your own starting pipeline**: Unit Tests is no longer pre-installed and locked. Every run begins with 3 empty slots, and you pick all 3 starting configs yourself — the run won't start until every slot is filled. Only your picks judge you — the gate demands what your configs demand, and payouts follow how well you answer; Unit Tests is now an ordinary pick that pays +32 KB per cleared gate, and like any other config it can be sold, stripped, or drafted later from the shop.
- **Every config now has a price — its check**: installing a config adds its own demand to the gate, and the gate fails if any demand goes unmet. The linters (ESLint, Stylelint) turn crossing out an answer into a pledge: a poll you linted must be answered correctly. IndexedDB wants 3 correct answers per gate and its income dries up at 320 KB per run. Code Coverage snaps if you miss two polls in a row. Intellisense now boosts all *coverage* ×1.5 (instead of storage) and wants coverage in two categories each gate. Coverage doubles your coverage gains (instead of paying storage) and only asks for +1%. Cold Start doubles your very first answer of the gate — as long as it lands. Copilot remains the only config with no strings attached.
- **Unit Tests levels up for storage**: each level costs 32 KB × the level bought (L2 = 64 KB) and buys both halves — +32 KB payout per level on clear, +1 correct answer demanded. Its automatic climb-escalation now stops at 4 of 5, so an un-upgraded Unit Tests always survives one miss at any depth; only bought levels can demand a flawless 5-poll day. Every upgradable config caps at level 5, and a focus config's demand now clamps to how many polls of its category actually appear — an upgraded `.js` asks for every JavaScript poll in a thin window, never an impossible count.
- **A tighter storage economy**: the run currency is rebalanced across the board. Your storage caps at 512 KB instead of a full megabyte, so every kilobyte counts for more. Rebuilding the shop's offer costs more and climbs faster (4 KB, then doubling each time). The linter now starts cheap at 8 KB but doubles every time you use it on the same poll, so leaning on it to clear a single poll gets expensive fast. Config draft prices rise by rarity, up to 256 KB for a legendary.
- **One gate a day**: the climb now hands out five polls per day — one gate's worth — instead of a long same-day deck. Answer them and the run locks until tomorrow — the game drops you off at the community board to see how everyone else did — and five fresh polls drop the next day. A half-finished gate carries over: tomorrow's polls complete it. Winning still takes clearing every gate — running out of polls no longer counts as (or pays out like) a victory, it's just the end of the day.
- **The climb is the front door now**: logging in — and visiting the site root — lands on `/run`, and the nav's "Daily Poll" entry became "Daily Run". The previous daily-poll game is parked under `/old/*` until it's removed.
- **Every screen of the climb has its own address**: the run now lives on real pages — `/run/configure`, `/run/answer`, `/run/reward`, `/run/shop`, `/run/strip`, `/run/over` — so a refresh keeps your place and the browser back button behaves (back from the shop returns to the reward summary). The game still owns the flow: whatever URL you land on, it puts you back on the screen your climb is actually at. This also mends the shop's community detour, which pointed at a page that no longer existed.
- **Gate results read like a CI run**: clearing *or* failing a gate now shows a build-log-style report under a "Gate success!" / "Gate failed!" headline. Each pipeline config is a row with a PASS / SKIP / FAIL badge, its chip, its description, and the coverage or storage it earned — a skipped focus reads "no css poll in this gate", a failed one "needs 1 correct ts, got 0". A "Steps: N passed, N failed, N skipped" line sits up top and the run totals (storage + coverage) at the bottom. The same PASS/PART/FAIL badges are used in the answer review, so status reads the same everywhere. On a failed gate the report sits above the remove-configs repair step.
- **The Dex** (`/dex`): a Pokédex-style collection screen with three tabs. **Polls** catalogues every poll — a coverage count, plus how many times you've seen each one you've met and your accuracy (green when you nail it, red when you don't); polls you haven't met stay listed by number but hide behind "???" so nothing's spoiled. Filter by category *and* by whether you've met it (All polls / Seen / Unseen — the two combine, so "the CSS polls I haven't met" is one tap each), and tap any column heading (ID, category, seen, accuracy) to sort. **Configs** shows the config collection grouped by rarity as a grid of the same chips you drop into a loadout, each one naming its rarity and effect on hover. **Swatches** shows the badge collection, unearned ones behind "???".
- **Readable poll options**: answers are now a clean numbered list; picking one marks it with a colored accent bar, and every poll says up front whether it wants one answer or several.
- **Poll results as a test run**: after a gate, your answers read like a test reporter — each poll is a row with a PASS / PART / FAIL badge, the question, and the coverage it earned. Click a row and it expands into a `describe/it`-style list: every option is an assertion that passed (you picked it and it was right), failed (a wrong pick, or a correct one you missed), or was skipped, with the explanation underneath.
- **The game tells the truth about gate demands**: requirement text now shows the escalated target for deeper gates (e.g. "Requires 3 correct answers"), matching the progress counter.
- **Mobile HUD**: on small screens the run bar collapses to the essentials, with a "Stakes" button revealing what the gate demands plus your streak, coverage, and loadout.
- **Themed backdrop**: the page behind the climb takes a faint tint of the current gate's color instead of pure black.
- **Start a new run from the summit**: the end-of-run screen has a button to begin a fresh climb once the next day's polls have dropped.
- **Clearer gate-failed screen**: what broke sits right under the headline, the fix is a highlighted card with a single instruction ("Remove 2 configs to continue →"), and the screen explains why fixed configs can't be removed.
- **Focused gate screens**: after a gate clears or fails, your answers tuck behind a one-line summary bar ("Review your 5 answers · 2 partial · 3 incorrect") — one click opens the full poll-by-poll review.
- Refactor shop design flow when skipping a shop
- Added Ruby configs
- Improve gate pathing visualizations
- **Runs continue where you left off**: stopping mid-run no longer loses your climb — come back any day and pick up with that day's fresh polls. Polls you skip are missed, not failed.
- **Community board** (`/run/community`): after the shop, the climb stops by the Community page ("Community →"). Under **today's polls**, every question carries the share of players who got it right — always in view, and coloured for how the room found it: green when most got there, amber when it split them, red when it ate them. Open a question and you get the same two lines the answer review gives you — the right answer, and whatever you picked — each with the avatar chips of exactly who chose it (you first) and the pick count; hover or tap a chip for the name. Everything nobody was choosing between folds behind "7 other options, 3 votes", so a nine-option question is two lines instead of nine, and unfolding it keeps every chip and count. On phones the whole question folds away — tap to open; desktop shows it open. Skipped polls stay sealed. Under the polls, **standouts today** crowns the day's champions — fastest answer (answers are now timed from the moment a poll appears to your submit), first to answer after the day's polls dropped, and most polls of one category — with your own haul totted up beside the heading ("you took all three").
- **Failed gates get the community breather too**: after removing configs on a failed gate, the run now stops by the Community page — just like after the shop — before the climb resumes.
- **Abandon a run**: give up mid-climb and start a fresh run the same day — the new run only serves polls you haven't answered today. Abandoned storage is forfeited.
- **Storage pays out by progress**: when a run ends, leftover storage is archived proportionally to how far you climbed — win the final gate for all of it, die halfway for half. Abandoning banks nothing.
- **No unwinnable polls**: a poll without a correct answer can no longer sneak into a run's daily sequence.
- **Coverage has stakes now, rising with every gate**: the deeper you climb, the more each correct answer pays — and the more a wrong one costs (gate 2 doubles both, gate 3 triples, and so on). Wrong answers hit harder on high-multiplier builds but never drop you below zero. Multi-answer polls pay coverage for the share you got right — but every wrong pick cancels a right one, so shotgunning pays nothing.
- **Instant answer verdicts**: submitting an answer paints your picks green or red for a beat — with the right answer revealed when you missed — before the run moves on.
- **Screens with a mood**: the gate-failed screen is bathed in red (buttons, HUD, backdrop included) and the gate-cleared summary in soft green, instead of everything staying default blue.

## 1.3.0 - 2026-07-06
### Added
- **Progress that carries between runs**: Storage you archive is kept and injected into your next run, so you no longer start every game from zero.
- **Avatar borders**: Earn decorative borders for your avatar as you play.
- **Loot when a run ends**: Finishing or falling in a run now rewards loot.
- **Fallen-player screen**: When your run ends, a dedicated screen shows how it went.
- **Community gate timeline**: See how the community progressed through each pipeline gate over time.
- **Community-chosen answers**: After you answer, see which answer the community picked.
- **Avatars in the community section**: Players now appear with avatars alongside community stats.
- **Poll history**: Review which polls you've encountered, when you last saw them, and how many times.
- **Pipeline head start**: Every run now begins with a pipeline already configured.
- **Current pipelines view**: See your active pipelines at a glance during a run.

### Changed
- **Overhauled answering flow**: The answering, results, shop, pipeline, and upgrade screens are now a clearer guided sequence with simpler navigation between them.
- **Redesigned game-over screen**: A richer, more polished end-of-run screen.
- **Clearer nudge to the next poll** after you finish answering.

### Removed
- **Awards page**: The standalone awards page has been removed.
- **Scores page**: The standalone scores page has been removed; score details now live within the run flow.

### Fixed
- **Special characters in answers**: Answers containing characters like `&`, `<`, and `>` now display correctly instead of showing raw codes.

## 1.2.0 - 2026-05-31
### Added
- **Post-answer tabbed carousel**: Answers, score, and shop are now split into three tabs — "Today's Poll", "Score & Pipelines", "Shop" — eliminating the long scroll after answering
- **Shop open/closed nudge**: The "Shop" tab label now shows a green "(open)" or red "(closed)" indicator so players know at a glance whether the shop is available
- **StorageBreakdown in Shop**: Storage usage is now displayed inline in the shop using the existing StorageBreakdown component

### Changed
- **Pipeline upgrade as full-page takeover**: When a pipeline upgrade is available, the entire screen is replaced by the upgrade selection UI — no other content is visible until a choice is made
- **Score & Pipelines layout**: ScoreBlock (1/3 width) and CI Pipelines are side-by-side; CategoryCoverageGrid sits full-width below
- **CI Pipelines header**: Demoted to secondary label style so ScoreBlock reads as the primary element

### Fixed
- **Question invisible pre-answer**: Poll question, code block, and sandbox embed were missing from the pre-answer screen
- **"Bonusses" typo**: Corrected to "Bonuses" in ScoreBlock
- **Shop card cut off**: Third card was clipped with no visible scroll affordance — layout now allows full horizontal scrolling
- **Page height gap**: Post-answer carousel had a large blank space below content caused by all steps rendering simultaneously; fixed by switching to conditional step rendering

## 1.1.0 - 2026-04-30
### Added
- **CI Pipelines**: Redesigned gate system — every few polls your pipeline is evaluated and all checks must pass or the run ends
- **Pipeline check types**: correct answers, coverage gain, short window, cold start — each with difficulty tiers (low → medium → high → critical)
- **Upgrade cards**: pass a pipeline to choose a new check or raise the difficulty of an existing one for a higher storage reward
- **Post-victory / endless mode**: keep playing after all pipelines are passed, aiming for 100% coverage
- **"First good"** community stat: tracks who was first to answer correctly
- **New categories**: Ruby, Python, Java, General Backend
- **New configs**: legendary config, public config, decreasing category weight configs
- **Stats page**: personal run statistics
- **Category weights display**: shows tomorrow's poll category distribution
- **Admin configs table**: usage stats and popularity sorting
- **Active config counter** shown in-run
- **`/polls` search**: filter by category with poll counts per category
- **My Polls** link in navigation
- **Leaderboard cards** UI
- **Last updated** timestamp in footer
- **Presentation mode**

### Changed
- Pipeline evaluation live progress shown during a window
- Shop item prices and booster sizes rebalanced
- Refund amount shown directly on the deinstall button
- Shop items persist across poll changes
- Migrated from ESLint to oxlint
- Refactored poll answer orchestrator into pipeline stages

### Fixed
- Game-over navigation reliability
- HTTP 414 error on large poll submissions
- Shop bug: deinstalling one of 3 items caused another to disappear
- Deflate config synergy
- Poll filter buttons now use category theme colors
- Unreadable placeholder text
- Duplicate poll response dedup

## 1.0.0 - 2026-01-31
🎉 **DevVoted is officially released!** The core gameplay loop is complete with all MVP features.

### Added
- **Levels Past 100**: Coverage can now exceed 100% with tier progression (L2, L3, etc.)
- **Shop Preview on Results**: See upcoming shop items after answering polls
- **Challenge Mode Expansion**: More varied CI gate challenges with persistent configs
- **Probability-Based Configs**: Configs that influence category selection weights
- **Leaderboard CI Gate Column**: Displays current CI gate in leaderboard
- **Show Missed Correct Answers**: After answering, see which correct options you didn't pick
- **Category Weights for Polls**: Configs can now influence which category appears next
- **Power-Down Telemetry Config**: New config that affects poll selection

### Changed
- **Try/Catch Config**: Now persistent across gates
- **Leaderboard Responsiveness**: Improved mobile display

### Fixed
- **Streak Display**: Streak now shows correct value instead of being +1 ahead
- **Category Weights Calculation**: Weights calculated on-the-fly when no snapshot exists
- **Gate Requirements**: Cleaned up gate challenge requirements
- **Multiple Choice Indeterminate State**: Correctly shows indeterminate state when some correct answers are selected
- **Duplicate Poll Responses**: Added database-level unique constraint to prevent race condition duplicates
- **Fastest Responder Stats**: Fixed NULL run_id handling in community stats query
- **Shop "0" Display Bug**: Fixed React rendering issue where `0 && <JSX>` rendered "0"

## 0.9.0 - 2025-12-31
### Added
- **New Configs**: `.length`, `indexed-db`, `includes`, and `telemetry` configs
- **Scoring for Incorrect Answers**: Partial credit system for wrong answers

### Fixed
- **Midnight Poll Invalidation**: Polls now properly refresh at midnight
- **Config Persistence**: Fixed bug where configs were lost between sessions
- **Shop Skip Reward**: Increased from 60KB to 64KB

## 0.8.0 - 2025-12-26
### Added
- **Gate Progress on Daily Poll**: Mini status bar showing CI gate progress while answering
- **Game Loop Explainer**: Onboarding text explaining game mechanics
- **Edit Poll Link**: Admins can now edit polls directly from daily poll view

### Changed
- **Improved Scoring Display**: Better visual breakdown of earned coverage

### Fixed
- **Shop Refresh**: New shop offers now appear each day
- **Active Config Cards**: Fixed display issues on desktop
- **Score Display**: Corrected scoring breakdown presentation
- **Progress Sticky Footer**: Improved mobile responsiveness

## 0.7.0 - 2025-12-17
### Added
- **Flexible CI Gate Challenges**: Configurable gate requirements
- **Deinstall Costs**: Removing configs now has a storage penalty
- **Skip Shop Feature**: Earn 64KB storage by skipping the shop

### Changed
- **Package Upgrades**: Updated all dependencies to latest versions

### Fixed
- **Large Poll Submissions**: Polls with 10+ options now submit correctly
- **Special Character Encoding**: Fixed `+`, `-`, `<`, `>` display in answers
- **localStorage Config**: Fixed storage calculation bugs
- **Poll Editing**: Resolved issues with saving poll changes

## 0.6.0 - 2025-12-09
### Added
- **Community Stats**: See who answered today's poll, first responder, fastest responder
- **Suggest Polls System**: Players can now submit poll suggestions
- **Explanation Field**: Polls can include explanations shown after answering
- **New Configs**: NoDeps, Intellisense, Copilot, Stylelint, grid-template-areas
- **GitHub Issue Link**: Quick link to report bugs
- **Code-Formatted Answers**: Markdown rendering in answer summaries

### Changed
- **Simplified Game Over Screen**: Cleaner end-of-run experience
- **Leaderboard Display**: Added explanatory text

### Fixed
- **Daily Poll Performance**: Optimized database queries with new daily_polls table
- **N+1 Query Issues**: Reduced database calls on progress page
- **Response Count**: Fixed incorrect community response counts
- **Countdown Z-Index**: Poll countdown no longer hidden behind elements

## 0.5.0 - 2025-11-30
### Added
- **Poll History in Gates**: See which polls you answered at each gate
- **Coverage Table**: Visual breakdown of category coverage
- **Poll Submitter Display**: Shows who created each poll
- **Simple Community Stats**: Basic participation metrics

### Changed
- **Shop Architecture**: Complete rewrite for better maintainability
- **Config Effects Management**: Centralized effect handling
- **Footer**: Updated from "Tanstack Query" to "Tanstack Start"

### Fixed
- **Rebuild Loading State**: Shows loading message during config rebuilds
- **ESLint Config**: Fixed behavior and added Stylelint config

## 0.4.0 - 2025-11-23
### Added
- **Server-Side Daily Poll Loading**: Improved initial load performance
- **Score Display**: Shows coverage earned after answering
- **Selected Answers View**: Review your choices after submitting

### Changed
- **Active Run Flow**: Improved navigation between game states
- **Daily Poll Layout**: Better organization of poll information

## 0.3.0 - 2025-10-24
### Added
- **Extended Game Rounds**: Rounds now include 5 polls instead of 3
- **Victory Conditions**: Proper win state with dedicated end screen
- **Poll Encyclopedia (Polldex)**: Track encountered questions and answer history
- **Run Reset Anytime**: Reset current run without losing overall progress
- **Smarter Shop Management**: Rebuild costs only increase on CI gate progression
- **Enhanced Configuration System**:
  - Improved bonus calculations with better mathematical foundations
  - More granular tracking with decimal percentage coverage
  - Random configuration generation with comprehensive test coverage

### Changed
- **Better Button States**: Shop buttons properly disable when out of storage space
- **Clearer Terminology**: Changed "reroll" to "rebuild" in shop
- **Refined Scoring System**: Complete overhaul of configuration and score calculations

### Fixed
- **Retroactive Config Bonus Bug**: Configuration bonuses now apply correctly
- **End Screen Display**: End screen now shows properly after run completion
