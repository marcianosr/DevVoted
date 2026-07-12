# ADR-007: Run rebuild — conventions and ground rules

## Status

Accepted. Governs the from-scratch rebuild of the run experience defined by ADR-005 (container) and ADR-006 (mechanics). Establishes the design system, architecture, and scope boundaries every rebuild bean must follow.

## Context

The prototype proved the loop is fun (ADR-006). We now rebuild the **run frontend from scratch** — not by porting prototype code, but by re-implementing the proven mechanics cleanly. The existing app keeps running; we carve the new run experience in beside it. These ground rules exist so every rebuild bean pulls in the same direction and we don't re-litigate conventions mid-build.

## Decision

### 1. Design system — Kanto colors per category

**app.css is the single source of truth.** It maps each category to a Kanto color via `[data-category-theme="<code>"] { --theme-color: var(--color-…) }`, and exposes `.text-theme` / `.bg-theme` / `.bg-theme-soft` / `.border-theme` / `.accent-theme` utilities that read `--theme-color`. The authoritative pairs:

| Category | Kanto | | Category | Kanto |
|---|---|---|---|---|
| html | vermillion | | react | celadon |
| css | cerulean | | git | pewter |
| js | saffron | | java | indigo |
| ts | lavender | | python | viridian |
| general-frontend | fuchsia | | ruby | cinnabar |
| | | | general-backend | seafoam |

**Do not duplicate this mapping in TypeScript.** To theme a subtree, spread `categoryTheme(code)` (`src/ui/theme/categoryTheme.ts` → `{ "data-category-theme": code }`) onto a container and style descendants with the theme utilities. Category colors are for Title accents, buttons, borders, and small accents — never large fills.

### 2. Typography — pixel font everywhere, three primitives

The pixel font (`Pixter Display`) is already the global `body` font; components inherit it. Three presentational primitives, in `src/ui/typography/`, each with a Storybook story under a **new container** titled `"Design System/…"`:

- **`Title`** — `text-3xl`, bold. White by default; accepts an optional `category` prop that self-themes the heading in that category's Kanto color (via `data-category-theme` + `.text-theme`).
- **`Subtitle`** — `text-lg`, `text-zinc-300` (lead text and section/eyebrow labels, e.g. "This gate needs", stat captions).
- **`Paragraph`** — base size, white.

Three primitives only — `Title`, `Subtitle`, `Paragraph`. All app-facing run text uses these — **no ad-hoc `<h1>`/`<p>`/`<span>` with inline sizes, and no extra label primitive.** Category-accented values (stats, titles) use `.text-theme` so they wear the active category's color.

### 3. Architecture — DDD bounded context with its own layers

- **`modules/` = new, `domains/` = classic.** Rebuilt bounded contexts live in `src/modules/` (e.g. `src/modules/session-run/`). Everything under `src/domains/` is the legacy app being replaced. **`modules/` may import `domains/shared/` (the schema-adjacent kernel — e.g. `categories`) but never a classic feature domain (`domains/runs`, `domains/polls`, …).** This makes the "don't extend old code" rule physical, not just intended.
- **Screaming structure**: a module's subfolders name the *concepts* (`gate/`, `pipeline/`, `configs/`, `draft/`, `climb/`), not technical layers. Opening the folder should say "this is a roguelike run," not "this is React."
- **The module owns its layers.** Domain logic lives in the concept folders (pure, no HTML/CSS). Presentational UI lives in **`src/modules/session-run/presentation/{concept}/`** (all HTML/Tailwind, Storybook-backed, plain props + callbacks only) — colocated with the bounded context, mirroring the domain concept folders. The application layer (routes) is figured out with TanStack Start later.
- **`src/ui/` is the shared design system only** — cross-cutting primitives (`typography/`, `theme/`, `rarityColors`). Module-specific visuals do **not** live there.
- **Pure engine first**: the ADR-006 mechanics port as pure, tested reducers/functions before any presentation wires to them.
- **No index barrels.** Import from the specific module file (`.../configs/config`, `.../gate/gate`), not a re-exporting `index.ts`. Barrels obscure the real dependency graph and invite import cycles.

### 4. Comments explain *why*, never *what*

Code is self-documenting through naming. Add a comment **only** when it captures reasoning the code can't show — a non-obvious constraint, a domain rule, a deliberate trade-off. Never narrate behaviour (`// filter the configs`, "Every check the gate imposes…") or restate what a well-named function already says; delete those. A comment that would still be true after the code changed is usually a *what* comment and should go.

### 5. Scope boundaries

- **Schema is the only existing code we build on.** All other existing frontend/domain code is ignored and rebuilt — do not import or extend old run components/services.
- **Users and their data stay intact.** No destructive migrations; the DB and `usersTable` are preserved (ADR-005: in-flight calendar runs finish read-only).
- **Outside-the-run features stay as-is**: border shop, profile, and similar are untouched for now.
- **Routes may be edited** to render the new components (that's the seam where new meets old).
- **Beans discipline**: always work against the *new* rebuild beans and ADRs 005–007. Ignore old-concept / brainstorm beans unless a new bean explicitly revives one.

## Consequences

- **Positive**: a clean, consistent, Storybook-testable run frontend with one type system for color and text; the old app keeps working during the rebuild; no data risk.
- **Negative**: temporary duplication (new `session-run` domain alongside the old `runs` domain) until the old run UI is retired. Accepted — parallel is safer than in-place rewrite.
- Each concept spans two folders inside the module — `modules/session-run/gate/` (logic) and `modules/session-run/presentation/gate/` (visuals). The concept name is the link, and both live in the bounded context.
