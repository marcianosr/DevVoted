---
# DVTD-zlpr
title: proto-run hand-rolls a reducer that useReducer already is
status: todo
type: task
priority: low
created_at: 2026-08-25T17:49:38Z
updated_at: 2026-08-25T17:49:38Z
---

`src/routes/proto-run.tsx:420-422`:

```ts
const [state, setState] = useState(() => createRun(POOLS, HANDED));
const dispatch = (action: RunAction) =>
	setState((current) => runReducer(current, action));
```

That is `useReducer` written out longhand. `src/routes/proto-session-slice.tsx:697` already does it the short way, including the lazy-init third argument:

```ts
const [state, dispatch] = useReducer(sessionReducer, 0, () =>
	createSession(buildSlicePool(POOL_SIZE), HANDED_TAGS)
);
```

Three lines become one, and `dispatch` stops being re-created on every render.

Watch for: `proto-run.tsx:463` applies `runReducer` directly to a local `next` inside a loop (a multi-action sequence). That call site is separate and stays as it is.

Raised while discussing prop drilling. Noted then that useReducer does not reduce the prop count — this is a separate, real simplification.
