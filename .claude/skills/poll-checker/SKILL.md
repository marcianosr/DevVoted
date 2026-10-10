---
name: poll-checker
description: Review a DevVoted poll before it ships for rhyme, a correct answer key, unambiguous options and explanations that explain. Use when the user says "check this poll", "review my poll", "does this rhyme", "is this answer right", pastes a question with options, or names a poll id or the drafts.
argument-hint: <pasted poll | poll id | drafts>
---

# Poll checker

## Checks

1. **Answer key.** Prove it, don't recall it. Run any JS/TS snippet with `node` in the scratchpad and compare the output with the options marked correct. A key that can't be run (CSS, HTML, opinion) → reason from the spec and name it.
2. **Ambiguity.** Could another option also be right under some runtime, version, browser or edge case? Does the stem give the answer away? `single` with two defensible options is a 🔴.
3. **Rhyme.** The question is a short Furnace Fun verse (wiki: "Polls rhyme"). Flag a missing rhyme, a forced word, or a verse that buries the actual question. See https://banjokazooie.fandom.com/wiki/List_of_Questions_From_Grunty%27s_Furnace_Fun as examples
4. **Explanations.** Not every option needs one. If you include an explanation, each should say *why* that option is right or wrong, not a restatement of the option. The poll explanation agrees with the key.
5. **House style.** Code is in backticks (ADR-137), no em dashes, the category fits.

## Report

```
## Poll <id or first words>
**Verdict:** ship | fix first

🔴 Wrong or ambiguous: … (proof: command + output)
🟠 Rhyme / explanation: …
🟡 Style: …

Suggested rewrite: <only for 🔴/🟠, keep the author's voice>
```

One block per poll. No findings is a valid result; say so.
