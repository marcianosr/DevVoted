# ADR-130: The bar carries what every screen needs

## Status

Accepted — 2026-09-27 (Marciano, DVTD-ql06, revised DVTD-rcoj and DVTD-ur53).
Leaves [ADR-128](128-the-hub-leads-with-its-press.md) decision 2 the only owner
of the clock.

Decision 9 reversed 2026-09-28 by
[ADR-133](133-the-chrome-wears-the-screen-under-it.md): the bar can reach the
screen's theme now, so it wears it instead of pinning its own.

## Context

The top bar was the last surface built before the kit. It was a raw-JSX
function inside `__root.tsx`, breaking [ADR-010](010-ui-layer-separation.md)
(a route states no HTML) and [ADR-102](102-copy-has-one-owner.md) (its labels
were inline literals). Rebuilding it raised four questions.

The first is the clock. ADR-128 decision 2 gave the time until the next polls
to the hub's press, and the bar took it everywhere else, because a player
answering a poll or reading the community has no press. Withholding it on the
hub alone read as a hole: a figure that vanishes on one screen of a same-shaped
bar looks like a failure to load. Carrying it everywhere cost the bar its shape:
a row of destinations with a ticking figure wedged in is two surfaces wearing
one.

The second is what the three destinations are to each other. Daily Run was a
filled pill, Community a bare link beside it, and Suggest a poll a bare link on
the far side of the clock. Three peers, three treatments, two clusters, and the
fill was not the active state, which was a ring the hover state also drew.

The third is who the bar is for. Every destination but the logo sits behind
`_authed`, which renders a login form in place of the page. Offering `Daily Run`
to a visitor was offering a door onto a wall.

The fourth is what else the bar is tempted to carry. It is the only surface on
every screen, which makes it the obvious home for any figure, and the obvious
way to give every figure two owners.

## Decision

1. **The bar states no clock.** The time until the next polls belongs to
   ADR-128 decision 2's press and to the community badge. A switcher between
   places with a ticking figure in it is two things wearing one shape. Dropping
   the clock everywhere leaves no hole: nothing can vanish from a shape that
   never held it.

   The cost is accepted. A player whose day is spent, on any screen but the hub
   or the community board, is told nothing about when it rolls over. The bar
   navigates; the hub reports.

2. **The clock hook states a duration, not a sentence.** `useNextPollsCountdown`
   returns `remaining` (`"6h 12m"`), not a pre-phrased label. Two surfaces word
   it, the hub's press and the community badge, and both say `New polls in`,
   which `~/shared/lib/copy.ts` owns. The hook stays in `~/shared/hooks/`
   because global chrome may not reach into the community aggregate, and the
   bar still calls it: decision 4's badge needs `isOpen` to tell a spent day
   from one that has just rolled over.

3. **Signed out, the bar offers only the way in.** No run press, no community,
   no clock. A bar that lists what you cannot reach teaches a visitor that this
   app's links do not work. The logo stays, because `/` is open.

4. **The badge is a bare figure, and says nothing at nought.** The run item
   reads `3` while the day has polls in it, counting
   `pollsPerGate - answeredThisGate.length`, and shows no badge otherwise. The
   spent day and the gate boundary, where the count is honestly zero, are both
   silent. A nought in a pill reads worse than an empty item, and both silences
   are the viewmodel's to decide, so the bar carries no rule about gates.

   A badge reading `5 polls today` on a half-spent day states the pool rather
   than what is left, and the pool is not something a player can act on. The
   count falls back to the whole window before a run is open and after one
   ends, because a new run can be started on both.

   The item carries its own accessible name, `Daily Run · 3 polls left`, joined
   the way `Button` joins a label and its detail. Without it a reader is handed
   "Daily Run 3".

5. **The bar scrolls away with the page.** It is not `sticky`, and no screen
   reserves a seat for it. Pinned chrome spends viewport on every screen for
   links a player reads once; the run's own figures, read on every poll, live in
   `Header` and pin themselves instead.

6. **The bar carries no storage figure.** The balance is stated where it is
   paid, by `Balance` ([ADR-124](124-the-balance-names-every-change-one-at-a-time.md)),
   and a second readout in the chrome would either lag it or duplicate its
   animation. The one run figure the bar carries is the polls badge on its
   press, because that is what the press is for.

7. **The bar's links are anchors the router may intercept.** `AppNav` takes
   `href` strings and an optional `onNavigate`. Every item is a real `<a href>`;
   an unmodified left press is handed to `useNavigate` instead. A router import
   inside a `.ui.tsx` would need a `RouterProvider` that Storybook does not
   have, and a plain anchor on the bar would turn every click into a document
   load. Sign out is the deliberate exception: it takes no `onNavigate`, so
   nothing can prefetch a route that signs you out.

8. **The three destinations are one group, and the mark stands outside it.**
   Daily Run, Community and Suggest a poll are peers, drawn by one `NavItem`
   under one rule: the destination you stand on is filled and ringed, every
   other is quiet text that fills on hover but never brightens to match. The
   run press used to wear its fill everywhere with `active` adding only the ring
   hover also drew, so being in the run looked exactly like pointing at it.
   Suggest a poll gained an active state, because a group where one member can
   never be selected is not a group.

   The player's mark leaves the bar and stands beside it on the black ground.
   Your own face is not a place.

   The group may shrink: the label truncates, the badge does not. Every item was
   `shrink-0` first, which at 320px let the group spill past the bar's border
   and under the mark rather than clip.

9. **The bar pins its own ground.** Pinned `data-screen-theme="pewter"` on the
   bar's wrapper, because outside every `Screen` it resolved against the `:root`
   cerulean, a visibly blue grey. Reversed by
   [ADR-133](133-the-chrome-wears-the-screen-under-it.md), which keeps pewter
   for a page with no screen under it.

## Consequences

Narrow screens drop the community and suggestion links, never the count. One
character costs what a sentence did not, and decision 4 leaves the count the
only status the bar carries. The two links reappear as `md:hidden` rows in the
account menu.

`--nav-seat` is gone from `app.css`, and with it the spec that read the
stylesheet to prove the token was declared. A pinned `Header` hangs from
`md:top-0`, because decision 5 leaves the top of the viewport empty. The bar
seats at the height of its contents: a small avatar and one row of text.

`__root.tsx` lost 128 lines and states no HTML. The bar is
`src/ui/kanto-theme/AppNav.ui.tsx` with a Story and a spec, wired by
`src/components/Nav.component.tsx`, the same split `AppFooter` and
`Footer.component.tsx` use. The mobile hamburger is gone; its items are
`md:hidden` rows in the account menu.

`useTodaysRun` takes an `enabled` flag. The bar is drawn before the session is
known, and a signed-out visitor should not spend a request learning they have
no run.

`pollsBadgeFor` joins the six exports ADR-128 gave `todayScreen.viewmodel.ts`;
`barClockFor` is deleted with the chip it fed. It returns `number | undefined`
rather than a phrase, so the bar states a figure and never a sentence. The count
reads `pollsPerGate - answeredThisGate.length` for the same reason the press's
mark does: `pollsLeftToday` counts the run's whole pool and reads `96` on a
seeded database. `pollsExhausted` signals a spent day, not a zero count: the
count hits zero at every gate boundary, where the polls have not run out, which
is why decision 4 makes both silences the viewmodel's.

The bar re-renders every ten seconds for a boolean. `useNextPollsCountdown`
ticks to keep a figure fresh the bar no longer draws; all it wants is `isOpen`.
Left as it stands, because the alternative is a second hook that answers one
question, but it is the first thing to change if the chrome ever costs anything.

`archiveLabelOf` moved from `profileScreen.viewmodel.ts` to
`~/shared/lib/storage.ts` as `archiveLabel`, because `src/ui/` may not import
runtime values from `src/modules/` and the menu states the same figure the
profile page does. Its suffix changed from `archive` to `archived`. `no title
yet` moved to `~/shared/lib/copy.ts` for the same reason.

The bar's avatar pins `data-screen-theme="vermillion"` rather than inheriting.
A player's mark is not the gate's to colour, and under decision 9's pin it would
otherwise wear pewter. The mark's `vermillion` and the badge's `saffron` win
over an ancestor's theme, because the ancestor's rule does not match the
element at all.

`AppNav` builds its count from `Badge` and its account lines from `Typography`
rather than hand-rolled class strings. `Badge` renders a `span` on its
decorative branch, which is legal inside an anchor; its pressable branch renders
a `button`, which would not be. The variants match the hand-rolled strings
exactly (`subtitle` is `text-sm font-bold text-theme-faint`, `hint` is
`text-xs text-theme-muted`), so the swap moved no pixels. `break-all` stayed on
a wrapper around the name alone, because `Typography` takes no `className` and
hoisting it to the shared parent would have broken the standing line mid-word.

Three menu items in the design were not built: How to play, Settings and
Keyboard shortcuts. None has a destination, and the keycaps drawn beside two of
them would have bound to nothing.
