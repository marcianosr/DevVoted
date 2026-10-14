---
paths:
  - "src/**/*.css"
  - "src/**/*.ui.tsx"
  - "src/ui/**"
---

# CSS

- **Styling**: Tailwind CSS v4. All HTML and Tailwind lives in Tier 1 `{Name}.ui.tsx` files (see `react.md`).
- `src/ui/old-theme/` is deleted (`DVTD-6crx`): **kanto is the only theme**, and importing `~/ui/old-theme/*` is
  an oxlint error.
- `src/styles/app.css` is exempt from the no-comments rule: its comments document the Kanto token system.
- Never run prettier on `src/styles/app.css`.
