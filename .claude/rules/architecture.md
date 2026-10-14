---
paths:
  - "src/modules/**"
  - "src/components/**"
  - ".dependency-cruiser.cjs"
---

# Module Architecture

New code lives under `src/modules/{context}/{aggregate}/{layer}`, where layer is one
of `domain/`, `application/`, `infrastructure/`, `presentation/`. Contexts are `run`,
`polls`, `collection`, `account`.

**Before creating any file under `src/modules/`, walk the decision tree in
[ADR-002 §5](../../docs/adr/002-domain-architecture.md#5-decision-tree-where-does-my-file-go).**
It gives you `(folder, suffix)` and the suffix allowlist in §4.1 is closed: no bare
filenames, no `.utils.ts`, no `.types.ts`, no `.queries.ts`, no `.handlers.ts`.

ADR-002 owns structure, layering, naming, and the dependency rule (machine-enforced
via `npm run lint` → `lint:arch`). [CONTEXT.md](../../CONTEXT.md) says which aggregate owns
which domain term.

The restructure is **done** (`DVTD-36ct`, `DVTD-wj1t`): `src/domains/` no longer
exists and every module lives in the context/aggregate/layer shape, with no
legacy carve-out in `.dependency-cruiser.cjs`. `src/components/` holds four
router-bound wrappers and is the last legacy surface.

## DTO Conversion in Models

`toDTO`/`fromDTO`/`toDTOs`/`fromDTOs` live in model files, never in `factories/`. Shape and naming: [ADR-002](../../docs/adr/002-domain-architecture.md).
