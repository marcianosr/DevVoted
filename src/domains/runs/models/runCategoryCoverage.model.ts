import type { InferSelectModel } from "drizzle-orm";

import type { runCategoryCoverageTable } from "@/src/database/schema";
import type { CategoryCode } from "~/domains/shared/categories";

// TODO: Refactor to "RunMetric"
export type RunCategoryCoverage = {
	id: number;
	runId: number;
	categoryCode: CategoryCode;
	currentCoverage: number;
	currentStreak: number;
	bestStreak: number;
	pollsAnswered: number;
	correctPollsAnswered: number;
	finalCoverage: number | null;
	finalStreak: number | null;
	finalPollsAnswered: number | null;
	finalCorrectPollsAnswered: number | null;
	createdAt: Date;
	updatedAt: Date | null;
};

export type RunCategoryCoverageRecord = InferSelectModel<
	typeof runCategoryCoverageTable
>;

export const runCategoryCoverageToDTO = (
	record: RunCategoryCoverageRecord
): RunCategoryCoverage => {
	return {
		id: record.id,
		runId: record.run_id,
		categoryCode: record.category_code as CategoryCode,
		currentCoverage: record.current_coverage,
		currentStreak: record.current_streak,
		bestStreak: record.best_streak,
		pollsAnswered: record.polls_answered,
		correctPollsAnswered: record.correct_polls_answered,
		finalCoverage: record.final_coverage,
		finalStreak: record.final_streak,
		finalPollsAnswered: record.final_polls_answered,
		finalCorrectPollsAnswered: record.final_correct_polls_answered,
		createdAt: record.created_at || new Date(),
		updatedAt: record.updated_at,
	};
};

export const runCategoryCoverageFromDTO = (
	dto: RunCategoryCoverage
): RunCategoryCoverageRecord => {
	return {
		id: dto.id,
		run_id: dto.runId,
		category_code: dto.categoryCode,
		current_coverage: dto.currentCoverage,
		current_streak: dto.currentStreak,
		best_streak: dto.bestStreak,
		polls_answered: dto.pollsAnswered,
		correct_polls_answered: dto.correctPollsAnswered,
		final_coverage: dto.finalCoverage,
		final_streak: dto.finalStreak,
		final_polls_answered: dto.finalPollsAnswered,
		final_correct_polls_answered: dto.finalCorrectPollsAnswered,
		created_at: dto.createdAt,
		updated_at: dto.updatedAt,
	};
};

export const runCategoryCoveragesToDTOs = (
	records: RunCategoryCoverageRecord[]
): RunCategoryCoverage[] => {
	return records.map(runCategoryCoverageToDTO);
};

export const runCategoryCoveragesFromDTOs = (
	dtos: RunCategoryCoverage[]
): RunCategoryCoverageRecord[] => {
	return dtos.map(runCategoryCoverageFromDTO);
};

export const createRunCategoryCoverage = (
	partial: Partial<RunCategoryCoverage> = {}
): RunCategoryCoverage => {
	const now = new Date();

	return {
		id: 0,
		runId: 0,
		categoryCode: "js" as CategoryCode,
		currentCoverage: 0,
		currentStreak: 0,
		bestStreak: 0,
		pollsAnswered: 0,
		correctPollsAnswered: 0,
		finalCoverage: null,
		finalStreak: null,
		finalPollsAnswered: null,
		finalCorrectPollsAnswered: null,
		createdAt: now,
		updatedAt: now,
		...partial,
	};
};

export const runCategoryCoverageFactory = {
	toDTO: runCategoryCoverageToDTO,
	fromDTO: runCategoryCoverageFromDTO,
	toDTOs: runCategoryCoveragesToDTOs,
	fromDTOs: runCategoryCoveragesFromDTOs,
	create: createRunCategoryCoverage,
};
