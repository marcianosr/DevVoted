---
# DVTD-ctj1
title: The first gate's SHAKY row says +0 B peel
status: completed
type: bug
priority: normal
created_at: 2026-09-29T10:05:34Z
updated_at: 2026-09-29T10:08:44Z
---

**What:** On the prep table at Pallet, the SHAKY row pays "+0 B peel" and the note under it says a miss owes a peel.

**Why:** Pallet is the calibration gate: a miss peels nothing. The row states that as a zero figure, which reads as a formatting error, and the note contradicts it.

## Done when

- [x] The SHAKY row at a gate that peels nothing reads "no peel" instead of a zero figure
- [x] The note under the table says a miss owes nothing at that gate, and keeps its peel sentence everywhere else
- [x] The Storybook calibration fixture draws the real Pallet ladder, including the SHAKY row
- [x] The wiki's prep description names the calibration reading

## Notes

Found from a screenshot of prep at Pallet: PERFECT, HEALTHY and OK all paid +32 KB and SHAKY paid "+0 B peel". The zero comes from GATE_FAIL_PEEL_SHARE[0] = 0 (ADR-057 decision 3) reaching signedKbLabel, which formats 0 KB as "0 B" and signs -0 as +. Proposed "0 KB penalty" rejected: penalty is a new word for the peel, and a zero figure still looks like a bug. The word the ADR and the wiki use is "no peel".

## Summary of Changes

- bandOutcomes.viewmodel: the SHAKY row reads `no peel` when the frame's peelKb is 0, and the note becomes FREE_MISS_NOTE ("Miss it and you owe nothing: the same gate runs again on 5 fresh polls."); the escrow sentence still appends. Both branch on one named condition, peelsNothing.
- Four new specs: the shaky row quotes a negative figure where a peel exists, says no peel at Pallet, and the note owes nothing there, with and without the rollback sentence.
- BandOutcomes.stories: the calibration fixture now draws the real Pallet ladder (60/40/0) with four rows and the free-miss note; it used to draw three rows with made-up ranges.
- wiki §prep: names the `no peel` reading and the note.

Not done here: a bare build's miss at Pallet is still fatal in code (DVTD-pshl), and the row does not say so. HEALTHY, OK and PERFECT quoting the same figure is DVTD-tjc7.
