---
# DVTD-0z1y
title: Stagger the equation reveal in time
status: todo
type: task
created_at: 2026-08-27T10:56:56Z
updated_at: 2026-08-27T10:56:56Z
---

Follow-on from DVTD-gdmv. Equation.ui currently renders complete: 'correct 1.0 x streak 1.1 x your build 1.25' and the paid line land together. Stagger them so the chips resolve in sequence and the total is unknown for roughly a second and a half.

Reasoning (2026-08-27 brainstorm): the 5-poll window is fully pre-committed by design, and that was confirmed as correct rather than fixed. Balatro's hand is also fully pre-committed at score time; its tension is entirely in the counting-up. This is the presentation change that makes a decision-free window tense, and it adds no systems.

- [ ] Sequence the factor chips, then the paid line
- [ ] Rail badges settle in step with their chip
- [ ] Respect prefers-reduced-motion
- [ ] Skippable: a second answer-press should not wait on the animation
- [ ] Stories for the staged states
