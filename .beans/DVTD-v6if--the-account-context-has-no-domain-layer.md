---
# DVTD-v6if
title: The account context has no domain layer
status: todo
type: task
created_at: 2026-08-13T13:46:46Z
updated_at: 2026-08-13T13:46:46Z
parent: DVTD-82c4
blocked_by:
    - DVTD-wj1t
---

Fold into **DVTD-wj1t** (migrate polls + account out of `src/domains`) rather than running as a separate pass — the files are already moving.

`src/modules/account/` is 13 files across two aggregates, and **neither has a `domain/`**. The domain concepts landed in the wrong layers as a result:

- `UserRole` (`user | poll-editor | admin`) and its display labels live in `profile/presentation/UserTitle.ui.tsx:1-6` — presentation
- `PublicUser` lives in `profile/infrastructure/profile.repository.ts:18-23` — infrastructure. `presentation/CreditList.ui.tsx:6-11` re-declares the same four fields as `CreditedPerson` to avoid a presentation-imports-infrastructure violation. Two names, one concept, neither in a domain file

Also:

- **`auth/presentation/Login.component.tsx` carries raw HTML and Tailwind** (:76-139 — `<div className="text-red-400">`, an inline 20-line `<svg>`, `className="w-full bg-gray-800 dark:bg-gray-700 ..."`). That is what `Auth.ui.tsx` is for
- **`Auth.ui.tsx:3,30` gates the whole email/password form on `process.env.NODE_ENV === "development"`.** A Tier-1 file reads its behaviour from the environment, so it cannot be exercised from a story or a prop-driven spec in either state
- **Zero presentation specs and zero stories in the module.** One spec total (`userSync.service.spec.ts`)
- `profile/application/profile.serverfn.ts` is 10 lines of validate-and-forward. Acceptably thin — it is the RPC and auth boundary — but it means `profile` has no application layer while `auth` does

## Todo

- [ ] Add `auth/domain` and `profile/domain`; move `UserRole` and `PublicUser` there
- [ ] Delete `CreditedPerson`; `CreditList` imports the domain type
- [ ] Extract `Login.component.tsx`'s markup into `Auth.ui.tsx`
- [ ] Make the dev-only form a prop, not a `NODE_ENV` read
- [ ] Add specs and stories for the account presentation files
