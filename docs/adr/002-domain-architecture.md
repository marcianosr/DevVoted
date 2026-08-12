# ADR-002: Domain architecture

## Status

Accepted, 2025-02-14. Last updated 2026-08-12. Living document: owns module
structure, layering, and naming for the whole app (ADR-007 and ADR-010 defer to
it).

**2026-08-12 revision.** Adopts a context → aggregate → four-layer DDD layout,
modelled on connect-portal ADR-083. This **reverses** the previous stance
("deliberately not tactical DDD, layered by convention"). See
[§8 What changed and why](#8-what-changed-and-why).

> **Read this if you are new to the codebase.** §5 is the decision tree for
> "where does my file go?". §4 is the closed suffix allowlist. Everything else
> explains the two.

---

## 1. Context

The convention-based layout worked while modules were small. It stopped working
once `run` grew past a hundred files, for one structural reason: the module
split on two axes at the same level and then repeated one of them.

```
run/
  climb/ pipeline/ gate/ configs/ draft/ community/     ← axis 1: concept
  api/ services/ validation/ view/ presentation/        ← axis 2: layer
      presentation/community/ configs/ gate/ poll/      ← axis 1 again
      presentation/run/ game/ screens/                  ← three names for one thing
```

`gate`, `configs` and `community` each lived in two folders. Changing the gate
meant touching `run/gate/`, `run/presentation/gate/`, `run/presentation/screens/`
and `run/view/runView.viewmodel.ts`. `pipeline/` and `draft/` had no UI folder at
all; their visuals were scattered through the other three.

The fix is to **nest the axes instead of letting them compete**: concept at the
top, layers inside each concept.

## 2. Structure

```
src/modules/
└── <context>/                  # coarse business area (run, polls, collection, account)
    └── <aggregate>/            # cohesive concept (gate, pipeline, config, …)
        ├── domain/
        ├── application/
        ├── infrastructure/
        └── presentation/
```

**The four-layer split happens at the aggregate level, not the context level.**
A context is a folder and nothing more; it holds no files of its own.

### DevVoted's contexts and aggregates

| Context | Aggregate | Owns |
|---|---|---|
| `run` | `run` | The run itself: `RunState`, `RunAction`, `runReducer`, status, snapshot, run-wide rules |
| | `pipeline` | The build: slots, installed configs, coverage |
| | `gate` | The checkpoint: requirement, pass/fail, reward, swatch, ladder, config role |
| | `config` | The item: `Config`, `Effect`, `Check`, roster, starter stacks |
| | `shop` | The offer: draft, rebuild, lock, extend |
| | `community` | Today's other players: standouts, voters, climb map |
| `polls` | `poll` | `Poll`, options, answer evaluation, categories, daily selection |
| | `authoring` | Admin poll CRUD |
| `collection` | `dex` | Polldex, configdex, swatchdex |
| | `unlockables` | Planned. The reason `collection` is a context and not an aggregate inside `polls` |
| `account` | `auth` | Login, signup, session |
| | `profile` | User, dev card, awards |

Screens belong to the aggregate whose concept they are about, not to a shared
screens bucket: `ShopScreen` is shop's, `RewardScreen` and `StripScreen` are
gate's, `ConfiguringScreen` is pipeline's. Cross-aggregate
`presentation → presentation` is allowed, so a screen composing pieces from
three aggregates is legal.

## 3. The four layers

- **`domain/`** — game concepts. Types, rules and invariants that survive a UI,
  transport or framework rewrite: `RunState`, `Pipeline`, `Gate`, `Config`,
  `Effect`, `Coverage`. Unlike a frontend-only DDD codebase, DevVoted's domain
  layer is **not anemic**: this app owns its rules, so `runReducer` and the gate
  engine are the real thing, not a projection of someone else's backend. That is
  why ADR-007's "pure engine first" holds: the domain layer is where the game
  actually lives.
- **`application/`** — orchestration and UI-state shaping. Server functions,
  services, hooks, viewmodels, Zod schemas. Things that exist because of the UI
  or the transport, but do not render.
- **`infrastructure/`** — adapters to external systems. Drizzle repositories.
  Anything that talks to Postgres, Supabase or a browser API.
- **`presentation/`** — React. Both tiers of ADR-010 live here: `.ui.tsx`
  (all HTML and Tailwind) and `.component.tsx` (wiring, zero HTML), plus stories.

### Dependency direction

```
        ┌─────────────────────────────┐
        │                             ▼
   presentation ──► application ──► domain
                         │             ▲
                         ▼             │
                    infrastructure ────┘
```

| Layer | May import | May **not** import |
|---|---|---|
| `presentation/` | `application/`, `domain/`, `src/ui/`, `src/shared/` | `infrastructure/` (go via an application hook or server function) |
| `application/` | `domain/`, `infrastructure/`, `src/shared/` | `presentation/` |
| `infrastructure/` | `domain/`, `src/database/`, `src/shared/` | `application/`, `presentation/` |
| `domain/` | other `domain/` code (own or another aggregate's), `src/shared/lib/` | everything else |

Type-only imports across layers stay allowed. Types are contracts, not coupling;
the rules bite on runtime imports.

### Cross-aggregate rules

An aggregate's `domain/` must not reach into another aggregate's `application/`
or `infrastructure/`. This is what stops a domain type leaking through a
viewmodel in a different aggregate.

Cross-aggregate `presentation → presentation`, `application → application` and
`domain → domain` are allowed. A public entry-point pattern between aggregates
is out of scope.

### Route boundary

- **`src/routes/` may import only from `<aggregate>/presentation/`**, plus
  `src/ui/` and `src/shared/`. A route that needs data mounts a presentation
  component that uses an application hook, same as every other consumer.
- **`src/modules/` may not import from `src/routes/`.** If something is needed
  by both, it belongs in `src/shared/`.

### Shared boundary

`src/shared/` is cross-context code: `src/modules/` may import from it, and it
may **never** import from `src/modules/`. It absorbed `src/lib/`, `src/utils/`,
`src/domains/shared/` and `src/config/` (moved 2026-08-12; none of them imported
from `modules/` or `domains/`, so the boundary held on day one). Layout:
`src/shared/lib/` holds the pure helpers `domain/` may import (§3 table);
everything else in shared is app-side and off-limits to `domain/`.

`src/ui/` stays where it is as the design-system half of shared. Folding it into
`src/shared/ui/` would rewrite a hundred imports for no boundary gain; the
constraint that matters (`src/ui/` may take only type imports from modules) is
already enforced and already passing.

## 4. File suffixes

One role per suffix. If a file does not match a suffix, it does not get one.

### 4.1 Closed allowlist

| Suffix | Role | Allowed layer |
|---|---|---|
| `.model.ts` | Canonical definition of a game concept (type + rules + factories) | `domain/` only |
| `.viewmodel.ts` | UI-shaped type or projection (`RunView`, filter state) | `application/` only |
| `.serverfn.ts` | `createServerFn` RPC seam. Owns auth extraction and input validation | `application/` only |
| `.service.ts` | Action that orchestrates across collaborators | `application/` only |
| `.validation.ts` | Zod schemas | `application/` only |
| `.repository.ts` | Drizzle access. Exported signatures name domain models, never DB row types | `infrastructure/` only |
| `.hook.ts` / `.hook.tsx` | React hook | `application/` *or* `presentation/` |
| `.ui.tsx` | Tier 1 visual: owns all HTML and Tailwind, plain props, has a Story (ADR-010) | `presentation/` only |
| `.component.tsx` | Tier 2 wiring: zero HTML, zero CSS (ADR-010) | `presentation/` only |
| `.stories.tsx` | Storybook story | `presentation/` only |
| `.factory.ts` | Test or seed data factory | any, colocated |
| `.spec.ts` / `.spec.tsx` | Tests, colocated with their subject | any |

**No bare filenames.** Every `.ts` / `.tsx` under `modules/` uses a suffix from
this list. The suffix is what makes the role machine-checkable.

**Filename casing:** PascalCase for `.ui.tsx`, `.component.tsx`, `.stories.tsx`;
`use`-prefixed camelCase for `.hook.ts(x)`; camelCase for everything else.

### 4.2 Retired and forbidden suffixes

| If you reached for… | The answer is | Why |
|---|---|---|
| `queries.ts` | `foo.repository.ts` in `infrastructure/` | Names the role, not the SQL verb. Reads and writes live together because they share the same table knowledge. |
| `handlers.ts` | `foo.service.ts` in `application/` | Orchestration is a service. Note connect-portal ADR-083 uses `.handlers.ts` for MSW; DevVoted does not use MSW, and reusing the suffix with a second meaning would mislead. |
| `foo.utils.ts` | Fold into the canonical file for the concept | If the helper is not *about* a concept, that is the smell. Truly cross-cutting goes to `src/shared/lib/`. |
| `foo.types.ts` | Fold into `foo.model.ts` or `foo.viewmodel.ts` | Types belong with the concept they describe. |
| `foo.constants.ts` | Fold into the model or viewmodel that owns the concept | Constants without a concept do not earn a file. Cross-cutting ones go to `src/shared/`. |
| `foo.mock.ts` | `foo.factory.ts` | One suffix per role. |
| `foo.dto.ts` | Inline `toDTO`/`fromDTO` into the model, mapping into the repository | The mapper is short and used in one place. |
| Bare `Foo.tsx` | `.ui.tsx` or `.component.tsx` in `presentation/`, per ADR-010 | No bare filenames. |

### 4.3 `.model.ts` vs `.viewmodel.ts`

The test is the layer test in §3: *would this concept survive a UI rewrite?*
Yes → `.model.ts` in `domain/`. No → `.viewmodel.ts` in `application/`.

`Gate` and `Config` survive; `RunView` (a 61-field flattened projection that
exists so screens take plain props) does not. Encoding the answer in the
filename is what lets tooling verify placement without inferring intent.

We do not use `.value.ts` or `.entity.ts`. The value-object/entity distinction is
real but does not earn its weight in a structurally-typed language.

### 4.4 No barrel `index.ts` files under `src/modules/`

Import directly from the file that owns the symbol. Barrels obscure the
dependency graph (every consumer looks like it depends on every re-export) and
make the §3 rules unreadable at a glance.

## 5. Decision tree: where does my file go?

First match wins. Each leaf gives you `(folder, suffix)`.

```
START: a new file under modules/<context>/<aggregate>/
│
├─ Is it a test? ────────────────────────────────► colocated beside its subject
│   (.spec.ts / .spec.tsx)                          (any layer, same folder)
│
├─ Is it a Storybook story? ─────────────────────► presentation/  •  Foo.stories.tsx
│
├─ Does it render HTML or use Tailwind? ─────────► presentation/  •  Foo.ui.tsx
│                                                   (plain data props, needs a Story)
│
├─ Does it render JSX but only to wire data? ────► presentation/  •  Foo.component.tsx
│                                                   (zero HTML, zero CSS)
│
├─ Is it a React hook?
│   ├─ About DOM or feel
│   │   (viewport, focus, scroll, motion)? ──────► presentation/  •  useFoo.hook.ts
│   └─ Shapes app state, or wraps a server
│       function for components to consume? ────► application/   •  useFoo.hook.ts
│       (Test: would another UI plausibly use
│        this hook unchanged? Yes → application.)
│
├─ Does it speak Drizzle, Supabase, or any
│   external system? ────────────────────────────► infrastructure/ • foo.repository.ts
│   (DTO ↔ domain mapping lives INSIDE this file)
│
├─ Is it a createServerFn call? ─────────────────► application/   •  foo.serverfn.ts
│   (owns getAuthenticatedUserId() + .validator)
│
├─ Is it a Zod schema? ──────────────────────────► application/   •  foo.validation.ts
│
├─ Does it ORCHESTRATE across collaborators
│   (repository + domain rule + side effect)? ───► application/   •  foo.service.ts
│
├─ Is it a UI-shaped type or projection
│   (RunView, filter state, pagination)? ────────► application/   •  foo.viewmodel.ts
│   (i.e. it disappears if the UI is rewritten)
│
├─ Is it a game concept that survives a UI
│   rewrite (Run, Pipeline, Gate, Config,
│   Effect, Coverage)? ──────────────────────────► domain/        •  foo.model.ts
│
└─ Otherwise: STOP. There is no canonical home.
   The concept is misshaped. Re-read §3 and §4.2.
```

### Re-classifying an existing file

> *"If I deleted this file, what would break: a feature, a concept, or an action?"*

- **A feature** ("we could not read runs from the database") → `.repository.ts` in `infrastructure/`.
- **A concept** ("we would lose what a `Gate` is") → `.model.ts` in `domain/`, or `.viewmodel.ts` in `application/` if it does not survive a UI rewrite.
- **An action** ("the daily rollover") → `.service.ts` in `application/`.

If the file does more than one of these, split it. `.service.ts` is reserved for
orchestration; it is not a junk drawer for "logic that is not UI".

Worked example from the 2026-08-12 migration: `seed.service.ts` was a pure
hash + PRNG + shuffle producing the day's poll sequence. No collaborators, no
side effects. Deleting it would lose *a concept*, not an action, so it became
`run/domain/seed.model.ts`. The misclassification only surfaced because
`infrastructure-stays-below` fired on the repository that imported it: a
service in `application/` that infrastructure needs is almost always a model.

## 6. The TanStack Start adaptation

connect-portal has a separate backend, so its `infrastructure/` means one thing:
an HTTP client calling a remote API. DevVoted is full-stack in one process, and
today's `api/` folder is three different things. They split as follows.

| Was | Is | Layer | Why |
|---|---|---|---|
| `api/queries.ts` | `foo.repository.ts` | `infrastructure/` | Drizzle against Postgres. The only thing touching an external system. |
| `api/handlers.ts` | `foo.service.ts` | `application/` | `handleApiOperation`, auth checks, orchestration. |
| `api/{domain}.ts` | `foo.serverfn.ts` | `application/` | `createServerFn`. See below. |

The server function looks like transport, so `infrastructure/` is the instinct.
It is wrong: putting it there creates an `infrastructure → application` arrow,
which §3 forbids. The correct reading is that `createServerFn` is a transport
decoration on an application service. The only external system in the picture is
Postgres, and only the repository touches it. Every arrow stays legal.

`.serverfn.ts` earns a suffix of its own rather than folding into `.service.ts`
for a reason specific to this repo: it is exactly the set of files where the
authorization rule applies (never trust a client-provided `userId`, extract it
from the session). A distinct suffix makes that lintable.

```typescript
// application/dailyPoll.serverfn.ts — the RPC seam
export const getDailyPoll = createServerFn({ method: "GET" })
  .inputValidator(z.object({ runId: z.number().optional() }))
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();   // never from `data`
    return getDailyPollService({ userId, ...data });
  });

// application/dailyPoll.service.ts — orchestration
export const getDailyPollService = async ({ userId, runId }: DailyPollInput) =>
  handleApiOperation(async () => {
    const poll = await findDailyPollForUser(userId);
    const run = runId ? await findRunById(runId) : await findActiveRun(userId);
    return { poll, run };
  });

// infrastructure/poll.repository.ts — Drizzle
export const findPollById = async (id: number): Promise<Poll> => {
  const [row] = await db.select().from(pollsTable).where(eq(pollsTable.id, id));
  if (!row) throw new Error("Poll not found");
  return toDTO(row);   // ← Poll (domain), not the row type
};
```

Why the three-way split: server functions are hard to unit test (auth mocking);
services are isolated from framework concerns, so they test with a mocked
repository; repositories isolate DB access. That reasoning predates this ADR and
is unchanged.

**One aggregate, one transaction.** The `run` aggregate's repository holds
`applyActionToRun`: a single `SELECT ... FOR UPDATE` on `run_states`, hydrate,
`runReducer`, write back. `run_states.state` is one JSON column, so the whole Run
is one document with one write path. Do not split that write across aggregate
repositories; a `gate.repository.ts` and a `pipeline.repository.ts` racing for
the same row lock is the failure this note exists to prevent. Other aggregates
read through the `run` aggregate's repository or through their own read-only ones.

## 7. Top-level structure

```
src/
├── modules/      # <context>/<aggregate>/<layer> — this ADR
├── domains/      # Legacy. Migrating to modules/, opportunistically
├── routes/       # TanStack Router file-based routes
├── database/     # Drizzle setup, schema, migrations, seeds
├── shared/       # Cross-context code. Never imports from modules/
├── ui/           # Design system. Type-only imports from modules
├── styles/       # Global Tailwind
├── test/         # Test setup, shared factories
├── presentation/ # Presentation-mode feature (slides). Unrelated to the layer name
└── components/   # Legacy
```

> `domains/` → `modules/` is in progress. New code goes under `modules/`;
> existing code migrates when touched, not as a big-bang rewrite. The migration
> currently includes **sanctioned duplication**: `modules/run/` is a rebuild of
> `domains/runs/prototype/`, and both live in the tree until the old run UI
> retires (ADR-007).

## 8. What changed and why

The previous version of this ADR said: *"deliberately not tactical DDD, no
aggregates, repositories, or ports, layered by convention inside each module."*
That is reversed. Three things forced it:

1. **Convention did not survive scale.** `run` reached ~150 files and the two
   axes collided (§1). Convention has no answer for "which of the two `gate`
   folders", because both were conventional.
2. **The layer folders were doing a concept's job.** `view/`, `services/` and
   `validation/` each held one or two files that belonged to a specific concept,
   while `presentation/` held 114 of 150 files. The split had stopped describing
   the code.
3. **A worked precedent exists.** connect-portal ADR-083 solves the same problem
   with the same constraints (TypeScript, React, dependency-cruiser) and has a
   decision tree that survives onboarding. Copying a proven layout beats
   inventing a third one.

What did **not** change: the dependency rule's direction, the domain layer's
framework-freedom, ADR-010's per-file tier split, and the reasoning behind
separating server function from orchestration from DB access.

## 9. Enforcement

`npm run lint:arch` (dependency-cruiser, `.dependency-cruiser.cjs`) fails on
violations. The config is rewritten alongside the file moves, not before: the
rules must describe the tree that exists. Rules to encode:

- The §3 layer table, per aggregate.
- Cross-aggregate: no `domain/` → another aggregate's `application/` or `infrastructure/`.
- `src/routes/` may import only `<aggregate>/presentation/`, `src/ui/`, `src/shared/`.
- `src/shared/` and `src/ui/` may not import from `src/modules/` at runtime.
- Suffix-to-layer placement from §4.1.

Two rules stay review-enforced because they are not expressible as a dependency
graph: "no HTML or Tailwind in `.component.tsx`", and "`.serverfn.ts` extracts
`userId` from the session". Both are candidates for a custom oxlint rule.

## 10. When to deviate

Don't. Every aggregate uses the four folders. Uniformity is what makes §5 an
answer rather than the start of a debate. If an aggregate feels too small for
four folders, create them anyway; empty folders cost nothing and the next
contributor never has to ask whether this one is a snowflake.

Two standing exceptions, both listed in `.dependency-cruiser.cjs`:

1. **`src/domains/`** predates this ADR and migrates slice by slice. Its guards
   live in the `legacy-*` rules. Do not add new concepts there.
2. **The dev rigs**, `src/routes/proto-run.tsx` and
   `src/routes/proto-session-slice.tsx`. They drive the run engine directly to
   exercise gates and screens without a server round-trip, so they import domain
   models at runtime, which `routes-only-into-presentation` otherwise forbids.
   They are test environments, not app routes, and they stay. The exclusion is
   scoped to those two filenames so it cannot spread.

## 11. Links

- connect-portal ADR-083, DDD architecture: the layout this ADR adopts
- [ADR-010, Two-tier UI separation](010-ui-layer-separation.md): the internal split of `presentation/`
- [ADR-007, Run rebuild conventions](007-run-rebuild-conventions.md): design system and rebuild scope
- [CONTEXT.md](../../CONTEXT.md): which aggregate owns which term
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/11/22/screaming-architecture.html)
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
