import { runCategoryXpTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

export type RunCategoryXp = {
	id: number;
	runId: number;
	categoryCode: string;
	currentXp: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
	createdAt: Date;
	updatedAt: Date | null;
};

export type RunCategoryXpRecord = InferSelectModel<typeof runCategoryXpTable>;

export const runCategoryXpToDTO = (record: RunCategoryXpRecord): RunCategoryXp => {
	return {
		id: record.id,
		runId: record.run_id,
		categoryCode: record.category_code,
		currentXp: record.current_xp,
		currentStreak: record.current_streak,
		bestStreak: record.best_streak,
		pollsAnswered: record.polls_answered,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const runCategoryXpFromDTO = (dto: RunCategoryXp): RunCategoryXpRecord => {
	return {
		id: dto.id,
		run_id: dto.runId,
		category_code: dto.categoryCode,
		current_xp: dto.currentXp,
		current_streak: dto.currentStreak,
		best_streak: dto.bestStreak,
		polls_answered: dto.pollsAnswered,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const runCategoryXpsToDTOs = (records: RunCategoryXpRecord[]): RunCategoryXp[] => {
	return records.map(runCategoryXpToDTO);
};

export const runCategoryXpsFromDTOs = (dtos: RunCategoryXp[]): RunCategoryXpRecord[] => {
	return dtos.map(runCategoryXpFromDTO);
};

export const createRunCategoryXp = (partial: Partial<RunCategoryXp> = {}): RunCategoryXp => {
	const now = new Date();
	
	return {
		id: 0,
		runId: 0,
		categoryCode: "",
		currentXp: 0,
		currentStreak: 0,
		bestStreak: 0,
		pollsAnswered: 0,
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

// Test factory functions
export const createMockRunCategoryXp = (overrides: Partial<RunCategoryXp> = {}): RunCategoryXp => {
	return {
		id: 1,
		runId: 1,
		categoryCode: "js",
		currentXp: 0,
		currentStreak: 0,
		bestStreak: 0,
		pollsAnswered: 0,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
		...overrides,
	};
};

export const createMockRunCategoryXpRecord = (overrides: Partial<RunCategoryXpRecord> = {}): RunCategoryXpRecord => {
	return {
		id: 1,
		run_id: 1,
		category_code: "js",
		current_xp: 0,
		current_streak: 0,
		best_streak: 0,
		polls_answered: 0,
		created_at: new Date("2024-01-01T00:00:00Z"),
		updated_at: new Date("2024-01-01T00:00:00Z"),
		...overrides,
	};
};

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

export const runCategoryXpFactory = {
	toDTO: runCategoryXpToDTO,
	fromDTO: runCategoryXpFromDTO,
	toDTOs: runCategoryXpsToDTOs,
	fromDTOs: runCategoryXpsFromDTOs,
	create: createRunCategoryXp,
};