---
# DVTD-j8cy
title: A failed run action tells the player nothing
status: todo
type: bug
created_at: 2026-08-13T15:29:44Z
updated_at: 2026-08-13T15:29:44Z
parent: DVTD-82c4
---

Split out of **DVTD-cmqj**, which made every server failure *inspectable* (one `ApiResponse` error mode) but did not make any of them *visible* for mutations.

`useRunActions.hook.ts:35` commits only on success:

```ts
const send = (action: RunAction) =>
	dispatch.mutate(action, {
		onSuccess: (result) => { if (result.success) commit(result); },
	});
```

and the call sites drop the failure on the floor:

- `RunPrep.component.tsx:36` — `if (!result.success) return;`
- `RunAnswer.component.tsx:64` — same
- `RunReview.component.tsx:36` — same
- plus `start` and `abandon` in the hook itself (`if (result.success) …`, no else)

So installing a config, answering a poll or starting a gate can fail server-side — expired session, lost connection, a rejected action — and the button just does nothing. The player has no way to tell "the click didn't register" from "the server said no".

The one exception, and the model to copy: `RunAnswer.component.tsx:135` feeds `abandon.data?.success === false ? abandon.data.error : null` into `ConfirmDialog`'s `errorMessage`, which already renders it.

## Todo

- [ ] Decide where a failed action speaks — inline by the button, a toast, or the existing `ConfirmDialog` pattern widened
- [ ] Surface `dispatch` failures from `useRunActions` rather than each call site guessing
- [ ] Cover one failing action per surface, asserting the player sees something

## Not in scope

Retry/offline handling. This is about telling the truth when an action fails, not about recovering from it.
