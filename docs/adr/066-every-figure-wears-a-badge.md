# ADR-066: Every figure wears a badge

## Status

Accepted (2026-09-11, Marciano, DVTD-tkzn). Generalises the facts-line rule the wiki
already carried in §8 ("the words stay muted and the number wears a chip") from one
screen to the whole kit.

## Context

`Figures.ui.tsx` has badged figures found inside prose since the kit was built, but only
*signed* ones — `+8 KB`, `−0.5%`, `×1.1`. Everything else was left to each caller, and
nine of them drew money as a bare span with its own hand-rolled styling: the header's
wallet split an amount from its unit across two spans, the header's coverage **held** was
bare while the **demand** beside it was already a badge, and `ConfigInfo`, `ShopScreen`
and `StoragePlan` each kept a private figure class that had drifted a little from the
others.

The cost is not tidiness. A figure and a word look the same when neither is boxed, so a
price reads as a prize — which is the failure the wiki's facts-line rule was written to
stop on the poll screen, and which every other screen was still free to make.

## Decision 1: a figure renders through `Badge` or `Figures`, never a bare span

A **figure** is a KB or MB amount, a coverage percentage, a price, or a multiplier.
Standalone it is a `Badge`; inside a sentence it goes through `Figures`, which splits the
prose and badges what it finds. No `.ui.tsx` writes a figure into a span of its own.

The rule is phrased against the render, not the data, so it is checkable by reading a
file rather than by tracing where a string came from: a `.ui.tsx` that interpolates a
number into text is either wrong or is going through `Figures`.

Slot counts are **not** figures. ADR-047 and ADR-060 already gave size its own
vocabulary — the weight block holds the numeral, and lists say it in words ("4 slots") —
precisely so a size cannot be mistaken for the KB beside it. Badging it would undo that.

## Decision 2: the hero readout is the one exemption

A screen gets **one** large bare figure: the headline the screen exists to announce — the
gate-clear gain, the balance that closes a ledger (`Ledger`'s `headline` tone). The
reason is rank, not taste. If every number on a debrief is a badge then nothing on it is
the answer to "what did I just earn", and the screen loses the beat it was built around.

`Ledger`'s `quiet` tone narrows to connective words — "of", "of 60% needed", the "102 →"
that belongs to the balance readout beside it. It is no longer an opt-out a caller can
reach for to keep a standalone figure out of a badge.

## Decision 3: `Figures` matches unsigned figures too

The regex gains a priced arm, so `32 KB` and `92.5%` are caught alongside `+8 KB`. A
bare count is still left alone — "peeked the community split 5 times" badges nothing,
because a count is not money and a sentence full of boxes is unreadable.

An unsigned figure takes **no colour**, and so follows the screen it sits on. Only a sign
earns a hue: `+` the caller's gain colour, `−` cinnabar, a sub-1 multiplier saffron. A
price painted green reads as a payout, which is the same confusion one layer down.

## Decision 4: `Figures` also badges a closed, case-sensitive vocabulary

Two things that are not figures now badge through the same parser: the band words
(DANGER…PERFECT) and the twelve poll category names. Both are nouns the reader
already meets as badges elsewhere — the coverage bar states a band, the community
board states a category — so leaving them bare inside a sentence made one word read
two ways depending on the screen.

The guard is what matters here, because an earlier attempt to teach the regex the
word "free" was rejected: `Figures` renders config descriptions, and "a **free**
upgrade" would have badged mid-sentence. A vocabulary is admissible only when it is
**closed** and **matched case-sensitively**. The game writes a band in caps and a
category as its own proper name, so neither can collide with ordinary prose — and
the lower-cased register the gate mix uses ("javascript 3") is left alone, which is
the behaviour we want rather than an accident we tolerate. A lowercase word stays
banned; badge it at the call site instead.

A category takes **no colour**, like an unsigned price. Hue means gain, loss or
term; a category is neither, and ADR-020 exists to keep hue off categories.

## Consequences

- Prose that carries a figure is now split across elements, so a spec asserting the whole
  sentence needs a `textContent` matcher rather than `getByText("…")`. Six specs moved.
- A price riding a press is carved out: `Button`'s `cap` and `detail`, and the upgrade
  price on a `ConfigChip`, stay as they are. A `Badge` cannot nest inside a `<button>`,
  and a press is already the badge-shaped affordance — boxing a box says nothing.
- `StoragePlan`'s rung caps were three text colours standing for reached / held / open.
  As badges they carry that on the wrapper's opacity instead, because `KantoColor` is a
  hue axis and hue already means something else everywhere in the kit.
- The header's wallet is one badge now (`1843 KB`), not an amount span beside a unit
  span. Callers still pass `amount` and `unit` separately; only the render joined them.
