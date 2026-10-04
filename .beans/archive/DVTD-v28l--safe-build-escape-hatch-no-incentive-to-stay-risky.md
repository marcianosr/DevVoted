---
# DVTD-v28l
title: 'Safe-build escape hatch: no incentive to stay risky after a fail'
status: scrapped
type: feature
priority: high
created_at: 2026-07-16T13:18:05Z
updated_at: 2026-08-20T08:49:02Z
parent: DVTD-kulw
---

Found during playtest (DVTD-8eij): once a build gets stripped down to a bare Defense+Economy config set (no Focus/Check/Risk), it becomes strictly dominant for the rest of the run -- gates 4-5 had zero conditions beyond the plain baseline number, no tension, coasted to summit.

This undercuts ADR-006's central pitch ("your build is as hard as you make it") -- there's currently no reward, multiplier, or victory condition that pulls a player back toward rebuilding a riskier stack after getting burned once.

Consider per game-designer input: escalate the baseline faster for minimal/bare builds specifically, or gate some reward tiers behind carrying at least one Focus/Check/Risk config. Needs a design decision, not just a bugfix -- loop in game-designer agent before implementing.

## Reasons for Scrapping

The mechanic this bean argues about no longer exists. It was written when every
config carried its own check; the failure it describes was selling off every
Focus/Check/Risk config until the remaining Defense+Economy build demanded nothing.

ADR-035 took checks off configs entirely — a config is now an effect with a price,
and all friction lives on the gate. There is no safe-vs-risky config axis left to
pull a player back toward (the roster has exactly one risk-family config,
Volkswagen CI), and "gates 4-5 had zero conditions" is unreachable: coverage demand
escalates 3% -> 340% per gate, audits start at gate 3, peels escalate 1 -> 6, and
gate width blocks an under-width build at shop exit.

The live question underneath it — does a high-coverage, low-variance build still
coast late in the run? — is a playtest measurement, not the design decision this
bean asks for. DVTD-rtm9 (coverage declines) is the nearest open thread.
