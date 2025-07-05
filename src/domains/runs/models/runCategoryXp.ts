import { runCategoryXpTable } from "@/src/database/schema";
import { InferSelectModel } from "drizzle-orm";

export type RunCategoryXp = {
	id: number;
	runId: number;
	categoryCode: string;
	currentXp: number;
	currentStreak: number;
	bestStreak: number;
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
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

export const runCategoryXpFactory = {
	toDTO: runCategoryXpToDTO,
	fromDTO: runCategoryXpFromDTO,
	toDTOs: runCategoryXpsToDTOs,
	fromDTOs: runCategoryXpsFromDTOs,
	create: createRunCategoryXp,
};