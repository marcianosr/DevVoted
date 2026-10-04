# ADR-187: The polls Dex is a box, and a poll is caught when answered right

## Status

Accepted — 2026-10-04 (Marciano, DVTD-xlcs). Amends ADR-151 for the polls tab.

## Context

The polls tab listed every poll as a row, unseen ones as `???`. It read like a
log, and a Pokédex separates what you have *seen* from what you have *caught*,
which the list never did.

## Decision 1: three states, caught means answered right once

`entryStateOf` in `polldex.model` reads a poll as **unseen** (never dealt),
**seen** (dealt, never answered right) or **caught** (answered right at least
once). A later miss does not un-catch a poll.

## Decision 2: one panel — strip, list, box, entry

- A strip of categories across the top, **all** first: name, seen of total, and a
  meter. A category with nothing seen reads dimmed.
- Left: only the polls you have seen, each `#001`, question, score (`1/1` green
  when caught, `0/1` saffron when not).
- Under it, the box: every poll in the filter as a numbered tile, green caught,
  saffron seen, dim unseen, headed "all 96 polls · 5 seen". An unseen poll is
  reached from the box only.
- Right: the entry, "#001 · CSS", the question, then dealt / answered / right.
