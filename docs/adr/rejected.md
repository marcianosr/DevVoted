# Tried and rejected

Directions that were designed, in several cases built, and dropped. Check here
before proposing one again: the argument that killed it is usually still live
even when the surrounding mechanics have changed.

Entries in the first section come from ADRs that have since been deleted, so
this file is their only home. The second section indexes rejections that still
sit in a live ADR, next to the decision they explain.

## Economy and capacity

**One meter: KB buys width as well as score** (was ADR-044 Context)
Configs multiply coverage, coverage earns KB. If KB also buys width then width
buys coverage buys width, a reinforcing loop with no brake. Drafted in the
ADR-044 session and abandoned before it shipped. The fix was never to forbid
buying width (Balatro sells joker slots too) but to give width a ceiling
measured in something the score cannot inflate.

**Coverage buys width** (was ADR-041, deleted by ADR-044)
An eight-rung ladder where some slots opened on coverage totals rather than
gates. It compounds a skill lead on the very axis that already decides whether
you clear. Coverage is score; score may not buy width.

**Storage capacity as a subscription** (was ADR-023, deleted by ADR-045)
A plan ladder renting a bigger KB cap, billed every gate pass or fail. Deleted
when a playtest showed 320 KB held against a 1024 KB cap: not binding, so not a
decision. Note the qualifier, since ADR-046 brought the cap back: it was never
binding *at those prices*. A slot now costs up to 768 KB against a 256 KB free
cap, so the same ceiling is a real constraint again.

Deleted a second time by ADR-074, and this time the qualifier does not save it.
The cap only ever bound because there was an expensive slot ladder to save
toward. With width billed per gate instead of bought, there is nothing to save
for, so a ceiling on the balance measures nothing. The subscription survives,
selling free build weight rather than held KB.

**A bought slot ladder** (was ADR-046 Decisions 1 and 2, deleted by ADR-074)
Slots bought outright off an escalating price, four free and twenty more for
sale. A price paid once stops being a decision the moment it is paid: a wide
build cost nothing to keep, so the only question width ever asked was whether
you could afford it that one time. Escalating the price delays that without
fixing it. Replaced by recurring upkeep, which asks the question at every gate.
Note what is *not* rejected here: ADR-044's rule that width needs a brake
measured in something the score cannot inflate. Upkeep is that brake, charged in
KB against a build measured in weight.

**Paying a perfect gate by raising the overshoot cap** (an ADR-075 draft)
Instead of a bonus, let `payoutRatioFor` run past `PAYOUT_RATIO_CAP` at 100%.
It pays nothing where it is needed: the cap only binds at the early gates, so at
gate 12, where the healthy line is 95% and coverage over the line reaches 1.05,
lifting it is worth a rounding error. Filling the bar is hardest exactly there.
A multiplier on the payout pays the same share at every gate, which is what the
flat gain of ADR-073 already assumes.

**Buying past a missed gate with KB** (an ADR-071 draft, deleted the same day; ADR-071 is itself retired, see ADR-076)
SHAKY could pay a bribe to advance instead of repeating the gate. It answered
the wrong objection. What makes a retry hollow is re-running the same attempt,
not getting it for free, and five fresh polls against a locked build is already
a different attempt. Keeping KB out of it also keeps KB spent on capacity and
configs, which is where the build decisions live.

**A cap-extension voucher, bought once** (was ADR-015 Decision 3, ADR-023 Context)
A flat one-time purchase converges every run: "can I afford it" is eventually
always yes, so every run buys the same thing and runs stop varying.

**Raising the cap with a config** (was ADR-015 Decision 3, reversed by DVTD-0h4n)
If raising the cap took a slot, every build would run it and the roster's
diversity collapses into "extender plus N free slots".

**A flat refund on an empty slot** (ADR-046 Decision 2 chose against it)
Buy the fifth slot for 32 KB, cash it for more than that, repeat. Refunding at
the position of the most expensive slot still held means buy-at-32 cashes for
exactly 32: no profit, and the purchase index stays a high-water mark so the
ladder never rolls back.

**Extra slots rented, with a buy-out** (was ADR-045 Decisions 3 and 4)
Built and pulled the same day. The buy-out added a second price, a second press
and a second piece of state to a section whose whole point was one choice.

**A rising rent per slot step** (was ADR-045 Decision 3)
Tried before the linear rent. It made every step a separate sum to work out, and
it priced the top of the ladder out of the game entirely.

**A filled cap as the plan purchase rule** (ADR-046 amendment chose reveal only)
Roughly 5x the bill-based requirement at every rung: 1 MB would ask 512 KB held
rather than 96. Since the top two rungs already bill more than a perfect gate-12
clear pays, requiring a filled 3 MB and 5 MB cap would close them for good.
Filling a cap reveals the rung above it and nothing more.

## Gates, checks and death

**Effect plus Check on every config** (was ADR-016 and ADR-022, deleted by ADR-035)
Every config carried a benefit and a gate condition, so the check was the price
of the effect and a perks-only build could not exist. Replaced when the friction
moved onto the gate itself: configs are pure enhancements, and the gate's own
coverage demand and audits do the judging.

**A synthesized baseline check** (was ADR-017, deleted by ADR-035)
The gate carried an always-on "N correct answers" row that every build paid for
regardless of configs. Removed on the motto that the gate should demand only what
your build demands.

**Pricing farming out instead of forbidding it** (was ADR-017 §2, ADR-022 Context)
The bet was that scaling the gate payout with window correctness would make a
freeloader build worthless. It missed that the climb is itself the reward: driven
through the real reducer, a Copilot plus two linters build summited on zero
correct answers, banking almost nothing and collecting all 13 swatches, the gate
depth and the victory, all free. A 0/5 clear paying 0 KB deters nothing when the
thing being farmed is the summit.

**A gate-level correctness floor** (was ADR-022 Rejected)
Built, and it broke no tests. Rejected because "get one right" already existed as
Unit Tests' check, so a gate rule duplicating it charges every build for
something only one build bought, and adds a demand with no checklist row to show
it. If a demand is real, some config's row says so.

**Forcing the lint fee (the declined-lint pledge)** (was ADR-022 Rejected)
A declined lint counted as a failure, with affordability explicitly not an
excuse. Reversed: a window the player cannot afford becomes fatal through no
decision of theirs, which is a trap. Competence can be owed; spending cannot.

**The width demand graded at the shop door** (was ADR-027 and ADR-031, deleted by ADR-035)
Leaving the shop under the coming gate's config count ended the run, with the
charge named in cinnabar before the click. It killed a run live in playtest. The
warning did not save it: the player's model in the shop is "this is where I
repair the build", not "leaving is entering the gate". A warned click that ends
the run is still a trap. Blocking the exit instead was the next shape, and it
went too when ADR-035 deleted the demand.

**Peel to zero, then die on the strip screen** (was ADR-021 Rejected)
The peel is a choice between configs. When the quota takes everything there is
nothing to choose, so the clicks only delay a verdict already reached.

**A shop button that ends a run** (was ADR-021 Rejected)
Death is the gate's job. A shop-side death is a trap, not a stake, and no failed
gate has charged for it.

**Poll exhaustion as a win** (was ADR-014 Context)
The engine treated running out of polls as a victory, which banks 100% of
leftover storage. On a small pool it surfaced as a bug: lose every gate, drain
the deck, and the end screen says won with a full cash-out. Running out of polls
is the normal end of every day, so it cannot be a terminal state.

**Gate N requires slot N** (was ADR-018, deleted by ADR-019 a day later)
Welding the climb to width made the gate number redundant (at the frontier it was
always `slots - 3`) and turned a clear with no coverage into an enforced replay
of the same gate. It prices depth in a currency the checks already charge for,
and its stall state ("cleared, still gate 3") reads as a bug.

**Die-by-score** (was ADR-034 Rejected, deleted by ADR-035)
A steeper coverage decline plus a collapse floor, so a camped gate could bleed a
run to zero. Rejected on three counts: it retunes every number in the game, it
punishes the score for a build failure, and death stops being legible at the
gate.

## Cadence and the shared seed

**Config-shaped personal runs** (was ADR-009 Rejected)
Configs that bias which polls appear require each player's poll set to differ,
which destroys the shared social layer and the same-seed leaderboard. Category
identity rides value instead: "I'm an HTML player" means HTML pays me more, not
HTML shows up more. No config may change which polls appear.

**One-day self-contained runs** (was ADR-009 Decision 1, deleted by ADR-011)
A run was that day's climb and did not span days, so death only ever risked
today. Rejected outright on the grounds that the game is a roguelite: a run
continues where you left off. The catastrophic-death objection it was protecting
against is accepted knowingly instead.

**A dedicated locked screen** (ADR-014 Consequences; one was built and removed)
The daily lock exists to stop progression, not to be a destination.

**Multiple parallel pipelines** (was ADR-006 Context)
Each pipeline a different lens on the window, all of them required to pass.
Scrapped: "which pipeline does this config go on?" was a mostly meaningless
choice since most effects are global, and adding a pipeline was pure downside, a
new demand with no reward.

## Configs and presentation

**Rarity as loot-tier hues** (was ADR-006 Decision 9 and ADR-043, deleted by ADR-047)
Four grades drawn as border and glow on a common/uncommon/rare/legendary ramp.
Every one of those hues already belonged to a gate swatch, so a grade and a gate
spoke the same colour about different things. The grade ladder itself went next:
`bit/crumb/nibble/byte` named six things at once and only the slot count did any
work.

**An achromatic rarity glyph** (was ADR-043 Decision 2, reversed the next day)
One neutral grey, on the reasoning that the cell count already carried the
ladder. The playtest hit the risk the ADR had named itself: once the grade became
the price, a price is the figure a player finds before reading anything else, and
grey was not that.

**Selling configs** (was ADR-015 Decision 4, later reversed)
Recorded as a deliberate absence so a future "add selling" idea would not start
from an oversight: the economy ran one-directional, storage to configs, and strip
already forced the build pivots selling does in Balatro. Selling landed anyway
with the config action popover (DVTD-86nr), refunding half the draft cost.

**Starter stacks** (was ADR-026 Decisions 1, 5, 6 and 7, deleted by ADR-052)
Three named preset loadouts to pick between at run start. Replaced by a dealt
hand of five. Two naming lessons survive the mechanic: a stack name has to state
its real headline category rather than a vibe phrase ("React Rush" was rejected
as "doesn't say anything"), and a name has to earn the identity it claims (Full
stack originally bundled three front-end configs).

## Also rejected, recorded in a live ADR

Full reasoning sits with the decision it explains.

- **Account-level rerolls**, ADR-029: progression bought outside the run cannot
  trade off against the configs it competes with.
- **"Widen" as Extend's name**, ADR-029: width is slot vocabulary, and two
  unrelated numbers would share a word.
- **A block-level Lock**, ADR-029: it would need a pick-an-offer mode to say
  which offer it means.
- **A red line under the offers**, ADR-029: built first; it spent two lines
  answering a question the player had not asked, far from the thing that said no.
- **Hue on the config chip's border**, ADR-060: built and rejected on sight, it
  reads as an alert.
- **Try/catch as the checkpoint carrier**, ADR-036: a catch handles an error in
  flight, it does not restore state.
- **The full pipeline report on the gate payoff**, ADR-026: per-config statuses,
  roles, checks. The storage breakdown stayed; the rest was a second screen's
  worth of reading.
- **A flat per-hit payout for Planning Poker**, ADR-085: it makes the optimal
  play "predict your own floor".
- **An exact-match payout for Planning Poker**, ADR-085 (shipped by 063, reversed):
  a bullseye rule makes a low card a prediction that you will bomb, so caution and
  a low card become opposite gestures and no cautious bet exists.
- **Coverage-earner, dedupe-by-effect, can-trigger-today and rarity weighting on
  the starting deal**, ADR-062: the draw stays uniform; the guarantees constrain
  shape, never the probability of power.
- **A drawn-audit floor under rivals' incidents** (the count minus one, or the old count with attacks replacing draws), ADR-099: either keeps the date dealing audits, and the second gives an attack no teeth.
- **Keeping gates 3 and 12 authored under player-fired audits**, ADR-099: the Champion's reliable challenge is its 90% line, and an introduction nobody fires is not one.
- **Skipping straight to the shop after a gate**, ADR-057.
- **The archived-storage random config pull**, ADR-050.
