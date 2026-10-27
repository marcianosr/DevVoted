---
paths:
  - "src/**/*.serverfn.ts"
  - "src/modules/**/application/**"
  - "src/modules/**/infrastructure/**"
  - "src/shared/utils/**"
  - "src/routes/auth/**"
  - "src/routes/logout.tsx"
---

# Backend

## Authorization (server functions) — security-critical

Never trust a client-provided `userId`. Every server function that reads or
writes a player's own data runs inside `withAuthenticatedUser`, which reads the
Supabase session once and hands the operation a
`Session = { userId, isAdmin, isGuest }`. `withAdminUser` is the same wrapper
that refuses a non-admin before the operation runs, and `withMemberUser` refuses
a guest (an anonymous session, ADR-178) the same way. All three live in `~/shared/utils/authorization.ts`, return the shared
`ApiResponse<T>` envelope, and turn a signed-out call into
`{ success: false, error: "Not authenticated" }` instead of a thrown 500.
(WRONG: `.validator(z.object({ userId }))` then `fetchUserData(data.userId)` — auth bypass.
RIGHT: `withAuthenticatedUser(({ userId }) => fetchUserData(userId))`.)

Accept `userId` as a parameter ONLY for public read-only data (profiles, player
cards, leaderboards), and always validate it exists. Never for writes. Anything
a screen needs to know about the caller (`isAdmin`) travels INSIDE `data`, never
beside the envelope. The pre-session functions (`loginFn`, `signupFn`,
`playAsGuestFn`, `fetchUser`) and the visit counter (`findAuthenticatedUserId`) are the only
server functions outside the wrapper.

Checklist for a new server function:
- [ ] Modifies user data? → `withAuthenticatedUser`
- [ ] Reads sensitive user data? → `withAuthenticatedUser`
- [ ] Admin only? → `withAdminUser`
- [ ] Buys permanence a guest must not get (ADR-178)? → `withMemberUser`
- [ ] Public read-only? → `userId` param allowed, with validation
- [ ] Returns `ApiResponse<T>`; the client unwraps with `useApiQuery` or checks `success`
- [ ] Test the rule in `authorization.spec.ts`, not per function (`@tanstack/react-start` is not importable under vitest)

## Error Handling in Handlers

Use `handleApiOperation` wrapper from `src/shared/utils/errorHandling.ts`:

```typescript
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const getPollByIdHandler = async ({ data }: { data: { id: number } }) => {
  return handleApiOperation(async () => {
    const poll = await fetchPollById(data.id);
    if (!poll) throw new Error("Poll not found");
    return poll;
  });
};
```

This returns a typed `ApiResponse<T>`:

```typescript
type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };
```
