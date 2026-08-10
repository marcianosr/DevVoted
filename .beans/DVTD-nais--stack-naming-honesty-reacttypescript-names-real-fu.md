---
# DVTD-nais
title: 'Stack naming honesty: React/TypeScript names + real Full stack combo'
status: completed
type: task
created_at: 2026-08-10T13:39:05Z
updated_at: 2026-08-10T13:39:05Z
---

Fifth same-day round on the onboarding work (after DVTD-46q8, DVTD-iyhz, DVTD-eel2, DVTD-v9ts). Marciano raised two more points after seeing the running stacks:

1. "I would assume JS related stuff would need a better name" — Ship it and Test everything are both JS/TS-heavy but their vibe names don't say so.
2. "Full stack contains these... not really full stack" (screenshot: css/html/package.json — entirely front-end).

Used AskUserQuestion for both since they're genuine design calls with multiple valid directions. Round 1 answers rejected my first guesses ("React Rush" as a name = "doesn't say anything"; the .html+.py+.git combo = "doesn't really make sense, group it in something that makes sense" / "make it realistic"). Read that as: he wants literal, recognizable identities — not invented vibe phrases, and not an arbitrary grab-bag of categories.

## Summary of Changes

- stack.model.ts: renamed "Ship it" -> "React" and "Test everything" -> "TypeScript" (states the real headline category; ids unchanged, still ship-it/test-everything internally). "Full stack" kept its name (real, recognizable industry term) but its configs changed from [css, html, package.json] to [vue, java, git] — a distinct frontend (not React/TS, already spoken for), a real backend language, and the one tool every stack ships through. Result: zero category overlap across all three curated stacks.
- Updated ConfiguringScreen.spec.tsx and stack.model.spec.ts assertions for the renamed display text (using unanchored /React/ and /TypeScript/ regex matches after learning sibling <Paragraph> spans render with no whitespace text node between them, so an anchored "name " pattern doesn't match the computed accessible name).
- ADR-026 Decision 6 added documenting both the naming rule (state the real category, don't invent a vibe phrase) and the full-stack combo rationale.
- CHANGELOG entry updated with new names/contents.
- Verified: tsc clean, oxlint+depcruise clean, 1344 tests pass (same 8 pre-existing failures as HEAD).
