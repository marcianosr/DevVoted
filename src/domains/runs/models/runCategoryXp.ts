import { runCategoryXpTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";
import { CATEGORY_CODES, type CategoryCode } from "~/domains/shared/categories";

// TODO: Refactor to "RunMetric"
export type RunCategoryXp = {
	id: number;
	runId: number;
	categoryCode: CategoryCode;
	currentCoverage: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
	finalCoverage: number | null;
	finalStreak: number | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type RunCategoryXpRecord = InferSelectModel<typeof runCategoryXpTable>;

export const runCategoryXpToDTO = (
	record: RunCategoryXpRecord
): RunCategoryXp => {
	return {
		id: record.id,
		runId: record.run_id,
		categoryCode: record.category_code as CategoryCode,
		currentCoverage: record.current_coverage,
		currentStreak: record.current_streak,
		bestStreak: record.best_streak,
		pollsAnswered: record.polls_answered,
		finalCoverage: record.final_coverage,
		finalStreak: record.final_streak,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const runCategoryXpFromDTO = (
	dto: RunCategoryXp
): RunCategoryXpRecord => {
	return {
		id: dto.id,
		run_id: dto.runId,
		category_code: dto.categoryCode,
		current_coverage: dto.currentCoverage,
		current_streak: dto.currentStreak,
		best_streak: dto.bestStreak,
		polls_answered: dto.pollsAnswered,
		final_coverage: dto.finalCoverage,
		final_streak: dto.finalStreak,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const runCategoryXpsToDTOs = (
	records: RunCategoryXpRecord[]
): RunCategoryXp[] => {
	return records.map(runCategoryXpToDTO);
};

export const runCategoryXpsFromDTOs = (
	dtos: RunCategoryXp[]
): RunCategoryXpRecord[] => {
	return dtos.map(runCategoryXpFromDTO);
};

export const createRunCategoryXp = (
	partial: Partial<RunCategoryXp> = {}
): RunCategoryXp => {
	const now = new Date();

	return {
		id: 0,
		runId: 0,
		categoryCode: "js" as CategoryCode,
		currentCoverage: 0,
		currentStreak: 0,
		bestStreak: 0,
		pollsAnswered: 0,
		finalCoverage: null,
		finalStreak: null,
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

// Test factory functions
export const createMockRunCategoryXp = (
	overrides: Partial<RunCategoryXp> = {}
): RunCategoryXp => {
	return {
		id: 1,
		runId: 1,
		categoryCode: "js",
		currentCoverage: 0,
		currentStreak: 0,
		bestStreak: 0,
		pollsAnswered: 0,
		finalCoverage: null,
		finalStreak: null,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockRunCategoryXpRecord = (
	overrides: Partial<RunCategoryXpRecord> = {}
): RunCategoryXpRecord => {
	return {
		id: 1,
		run_id: 1,
		category_code: "js",
		current_coverage: 0,
		current_streak: 0,
		best_streak: 0,
		polls_answered: 0,
		final_coverage: null,
		final_streak: null,
		created_at: new Date("2024-01-01T00:00:00Z"),
		updated_at: new Date("2024-01-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockRunCategoryXpArray = (
	count: number = 3
): RunCategoryXp[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRunCategoryXp({
			id: i + 1,
			categoryCode: CATEGORY_CODES[i % CATEGORY_CODES.length],
		})
	);
};

export const createMockRunCategoryXpRecordArray = (
	count: number = 3
): RunCategoryXpRecord[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockRunCategoryXpRecord({
			id: i + 1,
			category_code: CATEGORY_CODES[i % CATEGORY_CODES.length],
		})
	);
};

export const runCategoryXpFactory = {
	toDTO: runCategoryXpToDTO,
	fromDTO: runCategoryXpFromDTO,
	toDTOs: runCategoryXpsToDTOs,
	fromDTOs: runCategoryXpsFromDTOs,
	create: createRunCategoryXp,
};
