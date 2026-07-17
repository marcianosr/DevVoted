/**
 * Creates a factory that returns `defaults` merged with per-test overrides.
 *
 * Usage:
 *   const createMockPoll = createMockDataFactory<Poll>(defaultPoll);
 *   const poll = createMockPoll({ question: KANTO_QUIZ[0].question });
 */
export const createMockDataFactory = <T extends object>(defaults: T) => {
	// TODO(Marciano): confirm the merge strategy — this shapes every test in the rebuild.
	// Current: shallow spread — overriding a nested object/array replaces it wholesale.
	// Alternative: deepmerge (already a dependency) — terse deep tweaks, but nested
	// defaults leak into overridden objects and array semantics (concat vs replace)
	// need an explicit decision.
	return (overrides: Partial<T> = {}): T => ({ ...defaults, ...overrides });
};
