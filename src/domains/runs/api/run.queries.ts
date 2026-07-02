import { eq, and, desc, sql } from "drizzle-orm";

import {
	runsTable,
	runCategoryCoverageTable,
	pollCategoriesTable,
	pollResponsesTable,
} from "@/src/database/schema";
import { db } from "~/database/db";
import { STORAGE_UNITS } from "~/lib/storage";
import { calculateLootAmount } from "~/domains/runs/services/lootCalculator.service";
import { getInitialPipelineSlots } from "~/domains/runs/services/pipeline.service";
import { getPreRunSlot } from "~/domains/runs/data/pipelineSlots";
import type { StaticGateTypeId } from "~/domains/runs/data/pipelineSlots";
import {
	getCurrentGate,
	getWindowSize,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type {
	PipelineSlot,
	UpgradeCard,
} from "~/domains/runs/models/pipeline.model";
import type { CategoryCode } from "~/domains/shared/categories";

import { debitArchivedStorageGuarded } from "~/domains/economy/api/archive.queries";
import { calculateArchiveCredit } from "~/domains/economy/services/archive.service";

import { runFactory } from "../models/run.model";
import { runCategoryCoverageFactory } from "../models/runCategoryCoverage.model";

export class InsufficientArchiveError extends Error {
	constructor() {
		super("Not enough archived storage to inject into this run.");
		this.name = "InsufficientArchiveError";
	}
}

export type ExposedConfigDeck = {
	userId: string;
	displayName: string;
	photoUrl: string | null;
	configIds: string[];
	runId: number;
};

export const getActiveRunByUserId = async (userId: string) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "active")))
		.limit(1);

	if (!runRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runRecord[0].id));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryCoverage);
};

export const createRunForUser = async (
	userId: string,
	injectFromArchive: number = 0,
	extraPreRunSlotIds: StaticGateTypeId[] = []
) => {
	return await db.transaction(async (tx) => {
		// Debit first so an under-funded user fails before any run rows exist.
		// The whole tx rolls back if the insert later throws — archive is safe.
		if (injectFromArchive > 0) {
			const newBalance = await debitArchivedStorageGuarded(
				userId,
				injectFromArchive,
				tx
			);
			if (newBalance === null) throw new InsufficientArchiveError();
		}

		const { getSeasonForNewRun } =
			await import("~/domains/ranking/services/seasonService");
		const seasonId = await getSeasonForNewRun();

		const extraSlots = extraPreRunSlotIds
			.map(getPreRunSlot)
			.filter((s): s is NonNullable<typeof s> => s !== null);

		const [runRecord] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				season_id: seasonId,
				status: "active",
				storage_limit: STORAGE_UNITS.MB + injectFromArchive,
				injected_archive_bytes: injectFromArchive,
				pipeline_slots: [...getInitialPipelineSlots(), ...extraSlots],
			})
			.returning();

		const categories = await tx.select().from(pollCategoriesTable);

		const coverageRecords = await Promise.all(
			categories.map((category) =>
				tx
					.insert(runCategoryCoverageTable)
					.values({
						run_id: runRecord.id,
						category_code: category.code,
						current_coverage: 0,
						current_streak: 0,
						best_streak: 0,
						polls_answered: 0,
					})
					.returning()
			)
		);

		const categoryCoverage = coverageRecords
			.flat()
			.map((record) => runCategoryCoverageFactory.toDTO(record));

		return runFactory.toDTO(runRecord, categoryCoverage);
	});
};

export const getRunWithCategoryCoverage = async (runId: number) => {
	const runRecord = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(runRecord[0], categoryCoverage);
};

export const finishRun = async (runId: number) => {
	const [runRecord] = await db
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runRecord ? runFactory.toDTO(runRecord) : null;
};

export const markVictoryAchieved = async (runId: number) => {
	const [runRecord] = await db
		.update(runsTable)
		.set({
			victory_achieved_at: new Date(),
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return runRecord ? runFactory.toDTO(runRecord) : null;
};

export const getRunStats = async (runId: number) => {
	const stats = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	return {
		totalCoverage: stats.reduce(
			(total, record) => total + record.current_coverage,
			0
		),
		totalPollsAnswered: stats.reduce(
			(total, record) => total + record.polls_answered,
			0
		),
		bestStreak: stats.reduce(
			(maxStreak, record) => Math.max(maxStreak, record.best_streak),
			0
		),
	};
};

export const getAllRuns = () => {
	return db.select().from(runsTable).orderBy(desc(runsTable.created_at));
};

export const getRunForCompletion = async (runId: number) => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	return run;
};

export const getLastRunFromUser = async (userId: string) => {
	const lastRunRecord = await db
		.select()
		.from(runsTable)
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "finished")))
		.orderBy(desc(runsTable.finished_at))
		.limit(1);

	if (!lastRunRecord[0]) {
		return null;
	}

	const coverageRecords = await db
		.select({
			categoryCode: runCategoryCoverageTable.category_code,
			currentCoverage: sql<number>`COALESCE(${runCategoryCoverageTable.final_coverage}, ${runCategoryCoverageTable.current_coverage})`,
			currentStreak: sql<number>`COALESCE(${runCategoryCoverageTable.final_streak}, ${runCategoryCoverageTable.current_streak})`,
			bestStreak: runCategoryCoverageTable.best_streak,
			pollsAnswered: sql<number>`COALESCE(${runCategoryCoverageTable.final_polls_answered}, ${runCategoryCoverageTable.polls_answered})`,
			correctPollsAnswered: sql<number>`COALESCE(${runCategoryCoverageTable.final_correct_polls_answered}, ${runCategoryCoverageTable.correct_polls_answered})`,
		})
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, lastRunRecord[0].id));

	const totalPollsAnswered = coverageRecords.reduce(
		(sum, coverage) => sum + coverage.pollsAnswered,
		0
	);

	// Recompute the leftover-storage credit this run banked into the persistent
	// archive. completeRunWithThresholdFailure leaves storage_limit and configs
	// untouched, so the same inputs reproduce the value archiveLeftoverStorage
	// credited at run-end — no need to persist it separately.
	const runDTO = runFactory.toDTO(lastRunRecord[0]);
	const gateReached = getCurrentGate(totalPollsAnswered, runDTO.pipelineSlots);
	const archivedCredit = calculateArchiveCredit(runDTO, gateReached);

	return {
		run: lastRunRecord[0],
		categoryCoverage: coverageRecords.map((coverage) => ({
			...coverage,
			categoryCode: coverage.categoryCode as CategoryCode,
		})),
		totalCoverage: coverageRecords.reduce(
			(sum, coverage) => sum + coverage.currentCoverage,
			0
		),
		totalPollsAnswered,
		archivedCredit,
	};
};

// Preserves progress in final_* columns then resets current values
export const completeRunWithThresholdFailure = async (
	runId: number,
	reason: string
) => {
	return await db.transaction(async (tx) => {
		await tx
			.update(runCategoryCoverageTable)
			.set({
				final_coverage: sql`current_coverage`,
				final_streak: sql`current_streak`,
				final_polls_answered: sql`polls_answered`,
				final_correct_polls_answered: sql`correct_polls_answered`,
			})
			.where(eq(runCategoryCoverageTable.run_id, runId));

		await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
				completion_reason: reason,
			})
			.where(eq(runsTable.id, runId));

		await tx
			.update(runCategoryCoverageTable)
			.set({
				current_coverage: 0,
				current_streak: 0,
				polls_answered: 0,
			})
			.where(eq(runCategoryCoverageTable.run_id, runId));
	});
};

export const addConfigsToRun = async (runId: number, configIds: string[]) => {
	const [runRecord] = await db
		.select()
		.from(runsTable)
		.where(eq(runsTable.id, runId))
		.limit(1);

	if (!runRecord) {
		throw new Error(`Run with id ${runId} not found`);
	}

	const currentConfigIds = runRecord.active_config_ids || [];
	const updatedConfigIds = [...new Set([...currentConfigIds, ...configIds])];

	const [updatedRun] = await db
		.update(runsTable)
		.set({ active_config_ids: updatedConfigIds })
		.where(eq(runsTable.id, runId))
		.returning();

	const coverageRecords = await db
		.select()
		.from(runCategoryCoverageTable)
		.where(eq(runCategoryCoverageTable.run_id, runId));

	const categoryCoverage = coverageRecords.map((record) =>
		runCategoryCoverageFactory.toDTO(record)
	);

	return runFactory.toDTO(updatedRun, categoryCoverage);
};

export const awardStorage = async (
	runId: number,
	amount: number
): Promise<void> => {
	await db
		.update(runsTable)
		.set({
			storage_limit: sql`${runsTable.storage_limit} + ${amount}`,
		})
		.where(eq(runsTable.id, runId));
};

export const savePendingUpgradeCards = async (
	runId: number,
	cards: UpgradeCard[]
): Promise<void> => {
	await db
		.update(runsTable)
		.set({ pending_upgrade_cards: cards })
		.where(eq(runsTable.id, runId));
};

export const clearPendingUpgradeCards = async (
	runId: number
): Promise<void> => {
	await db
		.update(runsTable)
		.set({ pending_upgrade_cards: [] })
		.where(eq(runsTable.id, runId));
};

export const savePipelineSlots = async (
	runId: number,
	slots: PipelineSlot[]
) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({ pipeline_slots: slots })
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

export const appendPipelineSlotSnapshot = async (
	runId: number,
	snapshot: PipelineSlot[]
): Promise<void> => {
	await db.execute(
		sql`UPDATE ${runsTable}
		    SET pipeline_slot_snapshots = pipeline_slot_snapshots || ${JSON.stringify([snapshot])}::jsonb
		    WHERE ${runsTable.id} = ${runId}`
	);
};

export const applyPipelineUpgrade = async (
	runId: number,
	currentSlots: PipelineSlot[],
	newSlots: PipelineSlot[],
	currentSnapshots: PipelineSlot[][]
) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({
			pipeline_slots: newSlots,
			pending_upgrade_cards: [],
			pipeline_slot_snapshots: [...currentSnapshots, currentSlots],
		})
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

export const resetPollRerolls = async (runId: number) => {
	const [updatedRun] = await db
		.update(runsTable)
		.set({ rerolls: 0 })
		.where(eq(runsTable.id, runId))
		.returning();

	return updatedRun ? runFactory.toDTO(updatedRun) : null;
};

export type LootRunResult =
	| { ok: true; amount: number }
	| { ok: false; reason: "already_looted" | "not_fallen" | "self_loot" };

export const lootRun = async (
	targetRunId: number,
	looterUserId: string,
	looterRunId: number
): Promise<LootRunResult> => {
	return db.transaction(async (tx) => {
		const [target] = await tx
			.select()
			.from(runsTable)
			.where(eq(runsTable.id, targetRunId))
			.for("update");

		if (!target) return { ok: false, reason: "not_fallen" } as const;
		if (target.user_id === looterUserId)
			return { ok: false, reason: "self_loot" } as const;
		if (target.looted_by_user_id !== null)
			return { ok: false, reason: "already_looted" } as const;
		if (target.status !== "finished" || target.victory_achieved_at !== null)
			return { ok: false, reason: "not_fallen" } as const;

		const [{ pollsAnswered }] = await tx
			.select({
				pollsAnswered: sql<number>`COUNT(DISTINCT ${pollResponsesTable.poll_id})::int`,
			})
			.from(pollResponsesTable)
			.where(eq(pollResponsesTable.run_id, targetRunId));

		const slots = (target.pipeline_slots ?? []) as PipelineSlot[];
		const windowSize = getWindowSize(slots);
		const gateReached = Math.max(1, Math.ceil(pollsAnswered / windowSize));
		const amount = calculateLootAmount(gateReached);

		await tx
			.update(runsTable)
			.set({
				looted_by_user_id: looterUserId,
				looted_at: new Date(),
				loot_amount: amount,
			})
			.where(eq(runsTable.id, targetRunId));

		await tx
			.update(runsTable)
			.set({
				storage_limit: sql`${runsTable.storage_limit} + ${amount}`,
			})
			.where(eq(runsTable.id, looterRunId));

		return { ok: true, amount } as const;
	});
};
