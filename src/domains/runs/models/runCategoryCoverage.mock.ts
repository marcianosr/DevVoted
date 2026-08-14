import { CATEGORY_CODES } from "~/shared/lib/categories";

import type {
	RunCategoryCoverage,
	RunCategoryCoverageRecord,
} from "./runCategoryCoverage.model";

export const createMockRunCategoryCoverage = (
	overrides: Partial<RunCategoryCoverage> = {}
): RunCategoryCoverage => ({
	id: 1,
	runId: 1,
	categoryCode: "js",
	currentCoverage: 0,
	currentStreak: 0,
	bestStreak: 0,
	pollsAnswered: 0,
	correctPollsAnswered: 0,
	finalCoverage: null,
	finalStreak: null,
	finalPollsAnswered: null,
	finalCorrectPollsAnswered: null,
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-01T00:00:00Z"),
	...overrides,
});

export const createMockRunCategoryCoverageRecord = (
	overrides: Partial<RunCategoryCoverageRecord> = {}
): RunCategoryCoverageRecord => ({
	id: 1,
	run_id: 1,
	category_code: "js",
	current_coverage: 0,
	current_streak: 0,
	best_streak: 0,
	polls_answered: 0,
	correct_polls_answered: 0,
	final_coverage: null,
	final_streak: null,
	final_polls_answered: null,
	final_correct_polls_answered: null,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
	...overrides,
});

export const createMockRunCategoryCoverageArray = (
	count: number = 3
): RunCategoryCoverage[] =>
	Array.from({ length: count }, (_, i) =>
		createMockRunCategoryCoverage({
			id: i + 1,
			categoryCode: CATEGORY_CODES[i % CATEGORY_CODES.length],
		})
	);

export const createMockRunCategoryCoverageRecordArray = (
	count: number = 3
): RunCategoryCoverageRecord[] =>
	Array.from({ length: count }, (_, i) =>
		createMockRunCategoryCoverageRecord({
			id: i + 1,
			category_code: CATEGORY_CODES[i % CATEGORY_CODES.length],
		})
	);
