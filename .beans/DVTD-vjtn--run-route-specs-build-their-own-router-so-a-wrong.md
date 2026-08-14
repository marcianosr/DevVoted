---
# DVTD-vjtn
title: Run route specs build their own router, so a wrong route file passes
status: todo
type: bug
priority: normal
created_at: 2026-08-12T10:29:56Z
updated_at: 2026-08-12T10:29:56Z
parent: DVTD-82c4
---

RunLayout.component.spec.tsx constructs a memory router with leaf('/', RunStart). That asserts navigation logic but never checks that src/routes/_authed/run/*.tsx mounts the same components. /run shipped a TanStack scaffold stub ('Hello "/_authed/run/"!') while the spec was green, so RunStart was unreachable in the app. Found 2026-08-12 via an oxlint no-unescaped-entities error, not by a test.
