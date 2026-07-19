Your 10 items → beans
- DVTD-b9gj — Run start screen design. (new)
- DVTD-6l80 — Community page: more info on what other players did. (new)
- DVTD-smye — Awards on run community page (top-committers style). (new)
- DVTD-fdo4 — Linter button styling. (new)
- DVTD-g1p0 — Victory at gate 12 + reward. (new, draft — reward undecided)
- DVTD-acwh — "Add more configs" already covered by Config roster: renames + new configs.
- DVTD-5ljh — "Rarity drops" already covered by Rarity drop rates.
- DVTD-2try — "Unlockables" already covered by Config unlock system (draft).
- DVTD-30k6 — "Randomize starter configs" already covered by Randomly drawn configs at run start (draft).
- DVTD-uret — "Lock daily gates on 5 polls" folded into the existing Daily gate bean as a refinement note.


Questions:
- How will it go for players answering 1 or 2 polls per day versus players aonswering a full gate (5 polls)
- Should I allow players to answer more polls after a gate? How am I handling that against the social layer? And how does that work if someone wants to review their answer(s)?
- Showing the answers after the gate is nice, but some have omre detailed explanations. Currently it's just a list. What do we do here?
- Juicing up: show a -X number or +X numvber when adding/using storage
- "Next climb (continue)" should become - Start next gate (with a timer, or maybe if possible paid)
- Remove the "5" gates max -  GATE 1 / ?
- Configs: Look at my config map
  - change name of "correct"
  - add config that shows an answer someone else picked
  - add config that make polls occur more often
  - add config that increases your load-out worth (higher sell price)
  - Postgres: Extend your 1MB cap with a x2
  - Localhost: Extend your 1MB cap with 256KB
  - Docker: transfer your configs to a new run for free?
  - add a config to be allowed to go under 0 storage
- Only continune if you selected something fro mt
- Pipelines
  - 1 pipeline focusses on "speed" (faster = more points)
  - 1 pipeline forces you to answer mirrored (wrong answers only)
- Animate the tooltips
- Background color: soft kanto theme colors, radial background based on Hertek?
- Better icons?
- when bought a config, you can't reroll anymore
- Level X drops in shop from configs (like EsLint lv2 crossed 2 wrong answers) and costs more
- Good mobile views
- Randomly drawn configs at the start: RNG
- A way to unlock configs? Reaching gates? Having coverage?
- A page to show what configs you have unlocked, how many polls you answered in with category (poll dex) and which (only questions visible)
- Include code examples in polls

Wrapped in stories now:
- If my slots are full, I see configs to be selected but I cant actually select them. There should be a hint that this cannot be added unless there is more space
- Config packs (polls packs - new polls to play today, mystery configs, or requirements)
- After 1 gate players should come bck tomorrow, OR spend KB's to continue.
- Game over screen
- Community screen
- Show what others chose on gate clear
- Rarity drops
- Coverage... what to do with it?
- General Screen feel: How does it feel?



Really build it
- Real polls

DOne:
- Slots: You can now endlessly add slots untilk your max. - do we want that?

- Be able to switch your load-out on gate check
- Max 8 configs for pipeline - show that in descriptive text
- see chosen answers after each gate
- I can't choose to add another slot to the pipeline at the end of the gate
- I can add .css muktiple times: either on coverage pipeline or on correct answers pipeline. Does that make sense?
- The config colors are fun, but Im not seeing any rarity and the colors dont really make sense. Why are they these colors? IF we can't use colors for raritiy, how can we display that otherwise?
- It's also not so clear what pipelines you are building on
- On each gate pass, pipelines can be added or slots can be expanded or configs can be upgrades in the pipelines:
    - After every gate you should be able to add a pipeline
      - 1 pipeline focusses on "correct" answers
      - 1 pipeline focusses on "coverage" (more coverage = more points)

      - etc more?
    - Slots can be added every gate pass
    - The higher the gate, the more configs tyou need to drop if you fail
    - Start with 3 slots per pipeline

- COnfigs can be upgraed, but you risk losing a shield (you can see configs like this: more configs = more shields, but more configs = more risk of losing a shield
- I dont see if I answered the polls correct or not, I want to see that
