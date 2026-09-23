# ADR-102: Copy has one owner

## Status

Accepted — 2026-09-23 (Marciano, DVTD-gie6). Generalises the line
[ADR-040](040-config-status-online-skipped-offline.md) §Decision 2 drew for one
panel ("`SkipReason` is data, not prose… `Pipeline.ui.tsx` writes the copy") into
a rule for every surface.

Live. `src/shared/lib/copy.ts` holds the shared words, `plural` sits in
`displayValue.ts`, and eleven kanto `.ui.tsx` files carry a `COPY` object.

## Context

Copy was authored in five conventions at once with no rule saying which wins, so
~162 constants sat in kanto `.ui.tsx` files and ~200 more in viewmodels. Nothing
said which layer owned a string, and two patterns were live at the same time:
ADR-040 had the view writing prose, while `CommunityScreen.ui.tsx` took every
string as a prop.

The readable damage was a file like this, where the two lines are indistinguishable:

```ts
const TITLE = "Build";                        // a player reads this
const TITLE_ROW = "flex items-baseline gap-3"; // nobody reads this
```

`ConfigInfo.ui.tsx` carried `NO_UPGRADES` (classes) beside `NO_UPGRADES_LABEL`
(copy), and `SELL` beside `SELL_LABEL`. `CoverageRing.ui.tsx` named a Tailwind
constant `COPY`. Eight words had drifted into 21 declarations, `"Build"` alone
into four, and one empty-state sentence existed twice with different apostrophes.

## Decision

### 1. The test

Does choosing the string require reading run state?

- **No** → the component that renders it owns it.
- **Yes** → the viewmodel picks it and passes the result as a prop.

So `REFUSAL_COPY: Record<PaidRefusal, string>` and `SKIP_WORDS` stay in their
viewmodels; `GATES_TITLE = "gate by gate"` stays in `RunOverScreen.ui.tsx`.

### 2. In a `.ui.tsx`, copy lives in `COPY`

```ts
const COPY = {
	noUpgrades: "no upgrades",
	sell: "sells for",
} as const;

const SELL = "ml-auto flex shrink-0 items-center gap-1.5";
```

The use site then reads `{COPY.sell}` beside `className={SELL}`, and every
rendered string answers to `grep 'COPY\.'`. A Tailwind constant that collides with
a copy name takes the `_ROW` suffix already used in `Build.ui.tsx`.

This applies only where copy and Tailwind share a file. A viewmodel holds no
classes, so its named constants are already unambiguous and stay as they are.

### 3. A word two surfaces state lives in `src/shared/lib/copy.ts`

`BUILD`, `REGISTRY`, `AUDITS`, `WEIGHT`, `NEEDED`, `LOCKED_CONFIG`,
`WHAT_EACH_POLL_PAID`, `NOTHING_TO_COMPARE_YET`. It is `shared/lib/` and not a
theme folder because `AUDITS` and `NEEDED` are stated by both a kanto screen and
a viewmodel, and `domain-into-shared-lib-only` makes `shared/lib/` the one path
every layer can reach.

A word in that module is never re-declared locally.

### 4. Casing that differs by screen is register, not drift

`RunOverScreen.ui.tsx` is lowercase throughout — `coverage`, `gate by gate`,
`storage`, `total` — where `PollScreen.ui.tsx` title-cases its panel headings.
`Climber.ui.tsx` renders `you` into a name slot beside real usernames;
`PollResult.ui.tsx` renders `You` on a badge. Neither pair is folded. Two
constants are the same only when they share a word, a casing **and a role**.

### 5. Not copy

Glyphs (`·`, `›`, `%`), layout variant values (`"column"`, `"row"`), media
queries and SVG attributes stay bare constants. They carry no language.

Prose uses the typographic apostrophe: `today’s`, not `today's`.

### 6. One `plural`

``plural(count, one, many = `${one}s`)`` in `src/shared/lib/displayValue.ts`. It
was defined six times across four files under two signatures.

## Consequences

ADR-002 §4.2 forbids `foo.constants.ts` under `src/modules/`, and §5's tree has no
leaf for a copy file. That is why the shared module is `src/shared/lib/copy.ts`
and why per-file copy stays inside the file that renders it rather than earning a
sibling. `src/ui/kanto-theme/upkeep.ts` is the precedent for the shared module's
shape.

Test factories forward production copy instead of restating it — `src/ui` specs
may take only type-only imports from `src/modules/`, so `src/test/` is the seam
that re-exports a viewmodel's label. A factory that declares its own copy lets
production copy change while the test keeps passing against the old string.

No i18n library and no message keys. Each `COPY` object is a catalog fragment with
stable keys, so one could be lifted out later without re-doing this work.
