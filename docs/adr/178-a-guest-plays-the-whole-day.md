# ADR-178: A guest plays the whole day

## Status

Accepted — 2026-10-02 (Marciano). Scopes "play before sign-up" in DVTD-erjz.

## Context

The road to 100 daily players runs through visitors who arrive from a shared
result or a post and leave at a login screen. `/` sends a logged-out visitor to
`/login`. DVTD-erjz already chose Supabase anonymous sign-in, converted later with
`linkIdentity`, but left open how much of the game a guest gets.

## Decision 1: a guest gets today's five, every day

A guest plays the same five shared polls as everyone else, refreshed daily, with a
real run: a build, gates, the shop. A guest who returns for all thirteen gates
finishes the run without an account. That player is already the retention the game
wants, and a wall at gate N breaks the daily ritual that keeps them.

## Decision 2: one run, nothing to reveal more content

A guest has one run. No abandon, no reroll, no second run. Every press that would
reveal polls beyond today's five is refused on the server when the session's
`is_anonymous` claim is set.

## Decision 3: the account buys permanence and identity, not access

Withheld from a guest:

- the run on another device
- permanent swatches and unlocks
- archived KB
- Dex history
- titles and category records
- the marketplace and trading
- full profiles and open builds

A guest is absent from the community board, leaderboards, turnout and hover cards.
Sign-in is offered and never forced: at the first gate close, at the debrief, and
beside the daily reminder opt-in.

## Decision 4: the guest run lives on the server

"Keep the guest's run on this device" means an anonymous Supabase session, not a
run in browser storage. The session persists in the browser, so tomorrow on the
same device is the same `auth.uid()` and the same `run_states` row. `linkIdentity`
keeps that id, so signing in migrates nothing. Guests count as daily players,
because they have real ids.

## Rejected

- **A run in localStorage.** Run actions are server-authoritative and some are
  minted on the server. A client-held run needs a second reducer and is trivial
  to edit.
- **Five polls with no build.** It demos a plain daily quiz, not the game.
- **A hard wall after N gates.** It punishes exactly the players who come back.

## Consequences

- An incognito window can preview today's answers before a "real" play. A second
  GitHub account already allows this; accepted.
- Anonymous users pile up. A scheduled cleanup removes the stale ones, and
  anonymous sign-in is rate-limited (or captcha'd) in the Supabase auth config.
- Anonymous users hold the `authenticated` role, which is why RLS (DVTD-5kak)
  had to land first.
