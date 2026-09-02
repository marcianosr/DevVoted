import { vi } from "vitest";

/**
 * Chainable thenable db mock: every query-builder method returns the chain,
 * awaiting the chain consumes the next queued result. Writes (values/set)
 * record their payloads for assertions. Queue results in the exact order the
 * code under test awaits its queries.
 *
 * Shared by the two repository specs that talk to `run_states` and to the poll
 * sequence (DVTD-eyya split them). The state object stays declared in the spec
 * via `vi.hoisted`, because a `vi.mock` factory may close over nothing else.
 */
export type DrizzleMockState = {
	results: unknown[];
	setCalls: Record<string, unknown>[];
	valuesCalls: unknown[];
	insertTables: unknown[];
	updateTables: unknown[];
	deleteTables: unknown[];
};

const CHAIN_METHODS = [
	"from",
	"where",
	"orderBy",
	"limit",
	"innerJoin",
	"leftJoin",
	"returning",
	"onConflictDoNothing",
	"for",
];

export const createMockDb = (state: DrizzleMockState) => {
	const makeChain = () => {
		const chain: Record<string, unknown> = {};
		CHAIN_METHODS.forEach((method) => {
			chain[method] = vi.fn(() => chain);
		});
		chain.values = vi.fn((payload: unknown) => {
			state.valuesCalls.push(payload);
			return chain;
		});
		chain.set = vi.fn((payload: Record<string, unknown>) => {
			state.setCalls.push(payload);
			return chain;
		});
		chain.then = (resolve: (value: unknown) => void) =>
			resolve(state.results.shift());
		return chain;
	};

	const mockDb = {
		select: vi.fn(() => makeChain()),
		insert: vi.fn((table: unknown) => {
			state.insertTables.push(table);
			return makeChain();
		}),
		update: vi.fn((table: unknown) => {
			state.updateTables.push(table);
			return makeChain();
		}),
		delete: vi.fn((table: unknown) => {
			state.deleteTables.push(table);
			return makeChain();
		}),
		transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
			callback(mockDb)
		),
	};
	return mockDb;
};

export const resetDrizzleMock = (state: DrizzleMockState): void => {
	state.results.length = 0;
	state.setCalls.length = 0;
	state.valuesCalls.length = 0;
	state.insertTables.length = 0;
	state.updateTables.length = 0;
	state.deleteTables.length = 0;
};
