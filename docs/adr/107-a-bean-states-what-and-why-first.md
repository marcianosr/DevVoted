# ADR-107: A bean states what and why first

## Status

Accepted 2026-09-24 (Marciano, DVTD-w749). Live: all 123 open beans under the
DevVoted 2.0 milestone (DVTD-u35m) carry this shape.

## Context

Beans had grown into design documents. The median open bean under 2.0 was 1,398
characters, the longest 22k, and 68 of 123 were over 800. They opened with
analysis rather than intent, leaned on code symbols, file paths and ADR numbers,
and 24 of them described mechanics the engine has since replaced. Picking one up
meant reading a page before knowing what it asked for.

The detail was not the problem. Numbers tables, traced call paths and recorded
rejections are the reason these beans are worth keeping. The problem was that
they sat where the brief should be.

## Decision

**1. A bean opens with two labelled lines.**

```markdown
**What:** One line, present tense, what the player or the codebase gets.

**Why:** One line, the problem it removes.
```

The blank line between them is not optional. Consecutive lines collapse into one
run-on paragraph in every markdown renderer, `beans show` included.

**2. Then `## Done when`.** Two to six checkboxes, each an observable outcome in
plain language. This is the **only** unchecked list in a bean: beans refuses
`completed` while any `- [ ]` remains, so two lists mean a bean gated on steps
nobody intends to do. Implementation steps move to Notes as plain bullets.

**3. Then `## Notes`.** Everything else, verbatim. Nothing is deleted to make a
bean shorter. `## Detail` when the old body already has a Notes heading.

**4. Criteria are outcomes, not tasks.** "The screen says why the run parked",
not "wire the cause through RunView".

**5. Jargon stays out of the top.** Jargon means code symbols, file paths, ADR
numbers, bean ids and type names. The game's own vocabulary is not jargon and
stays: gate, run, config, coverage, storage, build, shop, audit, band. Inventing
synonyms for those is worse than using them.

**6. A stale premise is flagged, never silently resolved.** One line under the
Why:

```markdown
⚠️ The two death paths this bean describes are gone. Check before starting.
```

Flagging is not scrapping. The status does not change; the next person to pick it
up makes that call.

**7. An epic takes What and Why and no checklist.** Its children are the
checklist.

## Consequences

- The top of a bean is the brief and the bottom is the archive. A reader decides
  whether to pick it up from four lines.
- Checking the boxes is what closes a bean, so `Done when` has to be honest.
  A criterion nobody can observe is a criterion that blocks completion forever.
- Notes go stale, and the format does nothing about that. The ⚠️ line is the one
  piece of maintenance it asks for.
- Titles are plain language, readable without game context. Filenames are frozen
  at creation and do **not** follow a retitle, so a bean is cited by id, never by
  title. Anything quoting a title, including memory and older ADRs, may no longer
  match.
- Rewriting an existing bean is mechanical: author the header and the criteria,
  concatenate the old body under Notes. That separation is what let 123 beans
  move without losing a line, and it is how the next batch should be done.
- Five epics whose entire body was a single descriptive line lost that line,
  because the What restates it. That is the only content this format has ever
  been allowed to drop.
