# ADR-122: An audit may dial the build down, not only switch it off

## Status

Accepted — 2026-09-26 (Marciano, DVTD-5kbm). Ships **425 Too Early** and
**510 Not Extended**. Extends the roster ADR-038 decision 3 opened and keeps
[ADR-099](099-audits-are-fired-by-rivals.md) whole: both are payloads a rival
draws and fires, and neither is dealt by a gate.

## Context

Every audit that touches the build takes exactly one config and takes it to
zero. 424 takes one for the attempt, 502 and 503 move which one, 409 and 426
aim at the version edges. Five audits, one shape.

That shape cannot express two things the roster wanted. It cannot attack a
build that front-loads its window, because Overclock's whole value sits in the
gate's first answer and no audit reads where you are in the window. And it
cannot attack upgrades without deleting a config, so 409 and 426 have to pick
one victim and silence it completely — a blunt answer to a build that spread
its upgrades.

## Decision

1. **An audit may take the whole build for a moment.** `OfflinePick` gains
   `"whole-build-first-poll"`, the first pick that returns more than one config
   and the first that can return none. 425 uses it: the window's opening poll
   sees an empty build and the poll's ordinary base credit still scores.

2. **425 reaches everything a config does, not only coverage.** The pick feeds
   `liveConfigsOf`, which is also what the lint, the community peek, the storage
   faucet and the wager read. On the opener the build is simply not there. One
   rule, one sentence, and every config chip already reads `offline` and names
   the audit without a line of presentation work.

3. **An audit may dial a config down instead of out.** `resetsVersions` runs
   every config at its first version for the attempt. 510 uses it. Every
   level-sensitive read in the domain is `config.level ?? 1`, so `atFirstVersion`
   over the build is the whole implementation; `state.build.configs` keeps its
   versions, so they are back at the next gate.

4. **Both join the `offline-config` family.** Family exclusion is what stops a
   gate carrying two audits that fight over the same configs. 425 takes the
   build 409 would aim at; 510 flattens the very field 409 and 426 read to
   choose. Neither may land beside them.

5. **425's asymmetry against opener configs is deliberate.** It takes Overclock's
   ×4 and leaves the ×0.5 throttle that bought it. It also takes Cold Start's
   ×0 opener, which *helps* that build. Builds are open
   ([ADR-101](101-builds-are-open.md)), so a rival can see which of the two they
   are aiming at, and firing 425 at a Cold Start build is a wasted shot. Reading
   the target is the skill the open build was for.

6. **Pools follow power.** 425 costs about a fifth of a window's config value
   and is drawn from pool B; 510 can take a maxed focus config from ×2.25 to
   ×1.25 across a whole attempt and is Elite-tier only, beside 403 and 410.

## Consequences

510 does nothing to a build that bought no upgrades, the way 413 does nothing to
a build under 12 slots. That is a real dud risk and it is bounded by the same
thing that bounds 425's: `PublicBuild` carries each config's version, so an
attacker can tell before firing.

425 is the first audit whose effect is invisible on four polls out of five. Its
cue has to stay true for the whole window rather than describe the poll in front
of the player, which is why it reads "your build sits out the window's opening
poll" and not "your build is out".

`liveConfigsOf` now transforms as well as filters. It stays the one lens the
answering phase reads; the shop reads `state.build.configs`, so upgrade pricing
never sees a flattened build. A spec pins that, because `auditsOf` reads the
*upcoming* gate's schedule and the shop sits before the gate.

The domain still says `level` while the player reads `v2`. DVTD-tt4y renamed the
vocabulary and only landed in the UI. 510's copy says v1, and 409's and 426's
descriptions were corrected to match; the domain rename stays open.
