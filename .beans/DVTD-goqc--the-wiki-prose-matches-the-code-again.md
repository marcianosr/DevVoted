---
# DVTD-goqc
title: The wiki prose matches the code again
status: completed
type: task
priority: normal
created_at: 2026-10-20T08:38:49Z
updated_at: 2026-10-20T08:44:38Z
---

**What:** Correct every hand-written wiki passage that contradicts the code, found in a section-by-section audit on 2026-10-20.

**Why:** The generated tables were in sync but about 37 prose passages had drifted, so readers and agents learned rules the game no longer plays by.

## Done when

- [x] Gate, coverage and payout prose (sections 1-2) states the numbers and rules the code uses
- [x] Configs, shop and economy prose (sections 3-5) matches what the shop shows and charges
- [x] Meta, profile and community prose (sections 6-7) describes the screens as they are, with honest status tags
- [x] Interface, glossary and numbers (sections 8-10) describe the current poll screen and controls
- [x] Ambiguous citations to doubled ADR numbers name the ADR by its slug

## Notes

Code is leading (user, 2026-10-20). Trimming rationale and splitting the file are a separate follow-up. DVTD-4o32 (git tag unlock missing from 2.8) is folded in if still true.

## Summary of Changes

Fixed about 37 prose passages across sections 1-10 (band table OK/floor lines, Pallet clears on three right, band bonus in clear pay, pairs credit, seven config-taking audits, .length badge shipped, accuracy bar wording, upgrade lock text, run-held Focus coverage, no suggested opening, profile hero tiles and tab order, community panel names, review press timing, ads third variant, seasons and leaderboards tagged unbuilt, author bounty, poll screen coverage panel, build footer, keyboard and Next). Added git tag to the generated gate unlock column (wikiFacts.viewmodel.ts), which closes DVTD-4o32. Doubled ADR numbers 122/123/127/170 now carry a short topic tag.

Flagged, not fixed: the correct leaders board summary reads "All-time longest run of correct answers", which describes a streak; ProfileCard stories still pass a rank; ADR-194 is missing from docs/adr/README.md.
