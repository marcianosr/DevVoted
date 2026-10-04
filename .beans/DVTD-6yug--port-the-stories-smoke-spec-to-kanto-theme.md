---
# DVTD-6yug
title: Port the stories smoke spec to kanto-theme
status: todo
type: task
priority: normal
created_at: 2026-09-23T11:45:36Z
updated_at: 2026-09-23T11:45:36Z
---

`src/ui/old-theme/terminal-theme/stories.smoke.spec.tsx` globbed `./**/*.stories.tsx` and rendered every story, catching the class of failure in DVTD-la8l (a bare identifier in a story crashes at runtime, and stories are outside tsconfig so tsc never sees it).

It died with src/ui/old-theme in DVTD-6crx. kanto-theme has no equivalent, so ~120 kanto stories are now rendered by nothing in CI.

Recover the original from:

    git show 3df71fde:src/ui/terminal-theme/stories.smoke.spec.tsx

- [ ] Drop it in src/ui/kanto-theme/ (the glob is relative, so it needs no edit)
- [ ] Check it also reaches src/modules/**/*.stories.tsx, or add a second one
- [ ] Confirm it actually fails on a deliberately broken story before trusting it
