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
- `src/styles/app.css` only imports. The kit's tokens and utilities live in `src/ui/kanto-theme/kanto.css`; a
  game rule lives in a `.css` file in the `presentation/` folder of the aggregate whose component uses it, named
  after that component or concept, and `app.css` imports it ([ADR-200](../../docs/adr/200-src-ui-is-a-portable-kit.md)).
- No comments in CSS either.
- Never run prettier on CSS: the format glob covers ts, tsx, json and md only.
- Specs assert on CSS through `allStyles()` from `~/test/styles.harness`, never a single file path.
