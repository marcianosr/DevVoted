import { createMockDataFactory } from "@/src/test/createMockDataFactory";
import { RunCategoryXp, RunCategoryXpRecord } from "~/domains/runs/models/runCategoryXp";

const runCategoryXp: RunCategoryXp = {
	id: 1,
	runId: 1,
	categoryCode: "js",
	currentXp: 0,
	currentStreak: 0,
	bestStreak: 0,
	pollsAnswered: 0,
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-01T00:00:00Z"),
};

const runCategoryXpRecord: RunCategoryXpRecord = {
	id: 1,
	run_id: 1,
	category_code: "js",
	current_xp: 0,
	current_streak: 0,
	best_streak: 0,
	polls_answered: 0,
	created_at: new Date("2024-01-01T00:00:00Z"),
	updated_at: new Date("2024-01-01T00:00:00Z"),
};

export const createMockRunCategoryXp = createMockDataFactory<RunCategoryXp>(runCategoryXp);
export const createMockRunCategoryXpRecord = createMockDataFactory<RunCategoryXpRecord>(runCategoryXpRecord);

export const createMockRunCategoryXpArray = (count: number = 3): RunCategoryXp[] => {
	const categories = ["js", "css", "react", "typescript", "general-frontend"];
	return Array.from({ length: count }, (_, i) =>
		createMockRunCategoryXp({
			id: i + 1,
			categoryCode: categories[i % categories.length],
		})
	);
};

export const createMockRunCategoryXpRecordArray = (count: number = 3): RunCategoryXpRecord[] => {
	const categories = ["js", "css", "react", "typescript", "general-frontend"];
	return Array.from({ length: count }, (_, i) =>
		createMockRunCategoryXpRecord({
			id: i + 1,
			category_code: categories[i % categories.length],
		})
	);
};