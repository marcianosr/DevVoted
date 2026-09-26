---
# DVTD-8kiu
title: The profile becomes the one page that spends the archive
status: todo
type: feature
priority: normal
created_at: 2026-09-24T10:30:43Z
updated_at: 2026-09-25T11:00:14Z
parent: DVTD-u35m
---

**What:** Make the profile the page where archived storage is spent, and link to it from somewhere a player will find.

**Why:** The archive only ever goes up, and the page that spends it is unreachable and predates the kit.

⚠️ 2026-09-25: licences are dead (ADR-115). This page sells **run services**: bought once per run from the archive, consumed with the run, nothing equipped. The answer below still stands as "yes, this page sells in-run power"; the shelf is DVTD-0now.

## Done when
- [ ] The page is linked from somewhere a player will find
- [ ] The three screens are rebuilt on the kit, with stories
- [ ] It stocks more than borders, and an item can be earned rather than bought
- [ ] Another player's profile shows their name, not their id
- [ ] Empty states: nothing owned, nothing affordable, no balance
- [ ] Decided: storage only as the price, or storage plus a deed

## Notes

Archived storage only ever goes up. A run credits its leftovers at the end and
the number sits there. This bean makes one page the answer to "what is that
number for": the profile is the meta shop, and everything permanent is bought
there.

## Half of it already ships

`/profile/$userId` is routed and does buy borders today:

- `border.model.ts` is a catalog of 32 borders, already priced in archive bytes
  (256 KB to 10 MB) across common, rare, epic and legendary.
- `archive.serverfn.ts` exposes get, purchase and equip, each taking the user
  from `getAuthenticatedUserId()` and never from the client.
- `BorderShop.component.tsx` wires the grid, `ArchiveSummary` shows the balance
  and the owned count, `ProfilePage` shows both to the owner only.

So the loop is real. What is missing is everything that makes it a page a player
would actually visit.

## What is missing

1. **Nothing links to it.** `/profile/$userId` appears only in the generated
   route tree. There is no nav entry, no link from the run over screen, no link
   from the byline. A player who has never been told the URL cannot spend.
2. **It is not kanto.** `ProfilePage.ui`, `BorderShop.ui` and `ArchiveSummary.ui`
   are bare `h2`/`p` with raw Tailwind sizes. No `Panel`, no `Text` variant, no
   `Button`, no stories. It predates the kit and reads like it.
3. **Borders are the only stock.** Swatches, titles and starter slots are all
   permanent, all per account, and none of them are sold anywhere. If this is the
   meta shop it should have more than one shelf.
4. **Someone else's profile is a uuid.** The heading renders `Profile: <uuid>`
   because only the viewer's own name is in router context.
5. **An earned item has no shape.** Every border carries a numeric `cost`, so
   there is no way to express one that is won rather than bought. DVTD-406l
   already promises a Champion border for the summit, which today would have to
   be priced.

## Open decisions

- **Is the archive the only price?** A deed ledger already exists
  (`users.owned_swatch_ids`, permanent and idempotent). An item could cost KB, or
  a deed, or both. Decide before the catalog grows.
- **Does this page ever sell in-run power?** ANSWERED yes, 2026-09-24, ADR-110.
  This page sells **service licences**: archived storage buys one permanently,
  the player equips one before a run, and its service turns up once during that
  climb. ADR-082 still stands because a licence is not width, and ADR-050 D4 /
  ADR-051 D1 still stand because a licence is not a config. DVTD-lqjt is closed
  on the same decision.
- **Where does the link live?** Nav, the run over screen, the byline, or all
  three.

## Related

- DVTD-lqjt asks whether the archive needs an *in-run* sink. This is the
  out-of-run half and does not answer it.
- DVTD-yqy4 carries a stale line: "Today the archive is spent on start slots and
  the git tag. Nothing else reads it." `BorderShop` reads it. Worth correcting
  when that bean is next touched.
- DVTD-2try says "borders are cosmetic and depend on no trigger, split them back
  out if this bean gets too big to start". This is that split.
- DVTD-406l pays a Champion border at the summit.

## Todo

- Decide the price axis: KB only, or KB plus deeds
- Link the page from somewhere a player will find it
- Rebuild the three UIs on the kanto kit, with stories
- Model an item that cannot be bought, only earned
- Decide what else the shop stocks beyond borders
- Another player's profile shows their display name, not their uuid
- Empty states: nothing owned, nothing affordable, balance zero

## Border rarity styling, moved here 2026-09-24 (from DVTD-2try)

`BorderShop.component.tsx` carried this commented out, noted as "parked until
shop visual design is locked". Commented-out code did not travel into
`src/modules/`, so the intent lives in a bean instead. `Border.rarity`
(`common` | `rare` | `epic` | `legendary`) is on the model and is rendered by
nothing:

    common    -> ring-gray-500
    rare      -> ring-cyan-400
    epic      -> ring-fuchsia-500
    legendary -> ring-amber-300 animate-pulse

Reinstate by mapping `border.rarity` onto the card wrapper's ring colour. The
palette predates the kanto pass, and DVTD-ati1 makes the same complaint about
configs still being coloured by rarity — settle whether rarity is a visual axis
at all before wiring this. If it is not, delete the field rather than styling it.

## The second shelf: service licences (DVTD-r2k9, ADR-110)

Point 3 above — "borders are the only stock" — gets its answer. The page stocks
**service licences** beside the borders: a permanent purchase against archived
storage that lets a registry service be brought into one run.

What that settles for this bean:

- **Nothing links to it** (point 1) gets its motive. A cosmetic-only page is easy
  to leave unreachable; a page that sells the only in-run power the archive buys
  is not. Link it from the run over screen at minimum, where the archive credit
  is already stated.
- **The price axis** stays KB-only for licences. Deeds remain open for borders.
- Licence prices go in **bytes**, like `border.cost`, and sit in the borders'
  range (256 KB – 32 MB). Run storage is KB; do not mix the two.
- The purchase rebuilds `debitArchivedStorageGuarded`, whose shape and reasoning
  DVTD-lqjt preserved: a guarded `UPDATE … WHERE archived_storage >= bytes` is
  atomic under READ COMMITTED, so no TOCTOU race and no SELECT-then-UPDATE.
- Ownership takes the `user_titles` shape (ADR-109): owned rows in a join table
  plus one `equipped_*_id` pointer on `users`. That is also the shape point 5's
  earned-not-bought item wants, since a row can exist without a price.

Equipping happens before the run, not here. Selling and equipping are different
moments, and the Dex's shop tab only *states* a licence's price — it never sells.
