---
paths:
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "src/test/**"
  - "supabase/tests/**"
---

# Testing

- Co-located `.spec.ts(x)`; Vitest + Testing Library; jsdom
- Test setup includes jsdom environment and jest-dom matchers
- Mock at the boundary only: DB ops are mocked (chain `.values()`/`.returning()` on
  Drizzle builders). Don't mock your own component functions — use the factory pattern
  (`~/test/createMockDataFactory.ts`) for component data
- `vi.clearAllMocks()` over `vi.resetAllMocks()` (preserves implementations)
- Test names describe scenario + outcome; no "should"
- Canonical data from `~/test/kanto.ts`; prefer birthday/Christmas dates via `TEST_DATES`. Source: [https://bulbapedia.bulbagarden.net/wiki/Kanto]
