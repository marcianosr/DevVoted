---
# DVTD-ixjg
title: Postable daily result (terminal shape)
status: todo
type: feature
created_at: 2026-08-27T10:57:17Z
updated_at: 2026-08-27T10:57:17Z
---

The acquisition lever. One shared seed already means every player answers the same 5 polls each day, which is the hard precondition for a comparable result and it is already done. What is missing is the postable output.

Marciano picked the terminal shape over the emoji shape for flavour, having been shown the tradeoff.

Target:

 devvoted/daily · run #214
 ---------------------------
  ok poll 1      ok poll 4
  ok poll 2      ok poll 5
  XX poll 3
 ---------------------------
  gate 5 · Rainbow · CLEARED
  4 of 5 · 3 configs online

Two constraints found while designing it:
- The coverage number is NOT comparable between players: identical polls pay differently on different builds. The pass/fail pattern IS comparable, so the pattern leads and the score is decoration.
- Known tradeoff, accepted: monospace does not survive Slack or Twitter unless the poster wraps it in a code fence. Open detail: offer a non-monospace fallback variant, or emoji status marks inside the terminal layout, so the artifact still reads when pasted bare.

Spoiler rule: never reveal which option was correct. Positions and verdicts only.

- [ ] Decide the fallback variant for non-monospace contexts
- [ ] Compose from the existing run summary data, no new domain state
- [ ] Copy-to-clipboard on the gate result screen
- [ ] Spoiler audit: nothing in the string identifies a correct option
- [ ] Story + specs
