---
# DVTD-24
title: "Pipeline: inverted scoring — wrong answers score points"
status: draft
type: feature
tags:
    - brainstorm
created_at: 2026-04-30T11:04:31Z
updated_at: 2026-04-30T11:04:31Z
---

An inverted pipeline variant where selecting wrong answers is how you gain coverage. Flips the core game loop entirely.

The insight: polls are usually hard enough that knowing what's *wrong* requires knowing what's *right*. So this mode rewards deep knowledge in a counterintuitive way — obvious polls become the most dangerous because you can't fake ignorance.

Open questions:
- How does penalty work? Does selecting the correct answer *lose* coverage?
- On multiple choice: do you need to avoid all correct options, or just include at least one wrong one?
- Does the gate requirement stay the same, or does the threshold get adjusted?
- How do you communicate to the player that the rules are inverted without confusion?
