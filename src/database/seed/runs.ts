import { eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	runStatesTable,
	runsTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import { findTitleById } from "~/modules/account/profile/domain/title.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { startRunService } from "~/modules/run/run/application/run.service";
import { createRun } from "~/modules/run/run/domain/run.model";
import { SLICE_WINDOW, unbankedKb } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";
import { STORAGE_UNITS } from "~/shared/lib/storage";

import type { SeedClimb, SeedClimber } from "~/database/seed/cast";
import { SEED_CLIMBERS, SEED_PLAYERS } from "~/database/seed/cast";
import { hashOf } from "~/database/seed/random";

type ShellRunner = Pick<SeedClimber, "id" | "displayName" | "accuracy"> & {
	readonly climb: SeedClimb;
};

type RunSnapshot = ReturnType<typeof toRunSnapshot>;

const historyFor = (runner: ShellRunner, count: number): AnsweredPoll[] =>
	Array.from({ length: count }, (_, index) => ({
		id: `seed-${runner.id}-${index}`,
		question: "",
		category: "js" as const,
		outcome:
			hashOf(`${runner.displayName}:outcome:${index * 37}`) % 100 <
			runner.accuracy * 100
				? ("correct" as const)
				: ("wrong" as const),
		picked: [],
	}));

const insertShellRun = async (
	runner: ShellRunner,
	today: string,
	blank: RunSnapshot
): Promise<number> => {
	const { gatesCleared, pollsIntoGate, fell = false } = runner.climb;
	const { configs, coverageUnits, configsLost, startedAtGate } = runner.climb;
	const { storageKb = 0, lootedBy, closingBand } = runner.climb;
	const answeredCount = gatesCleared * SLICE_WINDOW + pollsIntoGate;
	const spoils =
		lootedBy === undefined
			? {}
			: {
					looted_by_user_id: lootedBy,
					looted_at: new Date(),
					loot_amount: unbankedKb(
						storageKb,
						gatesCleared - (startedAtGate ?? 0),
						false
					),
				};

	const [run] = await db
		.insert(runsTable)
		.values({
			user_id: runner.id,
			mode: "session",
			status: fell ? "finished" : "active",
			seed_date: today,
			completion_reason: fell ? "dead" : null,
			finished_at: fell ? new Date() : null,
			...spoils,
		})
		.returning({ id: runsTable.id });

	await db.insert(runStatesTable).values({
		run_id: run.id,
		state: {
			...blank,
			status: fell ? "dead" : "answering",
			gatesCleared,
			storage: storageKb,
			peakStorageKb: storageKb,
			coverage: coverageUnits,
			currentIndex: answeredCount,
			allAnswered: historyFor(runner, answeredCount),
			configsLost,
			startedAtGate,
			...(closingBand === undefined
				? {}
				: {
						lastClose: {
							gate: gatesCleared,
							band: closingBand,
							cleared: !fell,
						},
					}),
			build: { ...blank.build, configs: CONFIG_LIST.slice(0, configs) },
			window: {
				...blank.window,
				answered: pollsIntoGate,
				correct: Math.round(pollsIntoGate * runner.accuracy),
			},
		},
		engine_status: fell ? "dead" : "answering",
		gates_cleared: gatesCleared,
		coverage: coverageUnits,
		polls_answered: answeredCount,
	});

	return run.id;
};

export const seedClimberRuns = async (
	today: string
): Promise<Map<string, number>> => {
	const blank = toRunSnapshot(createRun([], []));
	const runByClimber = new Map<string, number>();

	for (const climber of SEED_CLIMBERS) {
		runByClimber.set(climber.id, await insertShellRun(climber, today, blank));
	}

	return runByClimber;
};

export type PlayerRuns = {
	readonly started: readonly string[];
	readonly fallen: readonly string[];
};

export const seedPlayerRuns = async (today: string): Promise<PlayerRuns> => {
	const blank = toRunSnapshot(createRun([], []));
	const started: string[] = [];
	const fallen: string[] = [];

	for (const player of SEED_PLAYERS) {
		const { todaysRun } = player;
		if (todaysRun === undefined) continue;

		if (todaysRun === "started") {
			const run = await startRunService({ userId: player.id, date: today });
			if (!run.success)
				throw new Error(`${player.displayName} could not start: ${run.error}`);
			started.push(player.displayName);
			continue;
		}

		await insertShellRun({ ...player, climb: todaysRun }, today, blank);
		fallen.push(player.displayName);
	}

	return { started, fallen };
};

export const seedArchivedRuns = async (
	userId: string,
	today: string
): Promise<number> => {
	const blank = toRunSnapshot(createRun([], []));
	const archive = [
		{
			gatesCleared: 12,
			coverage: 61,
			reason: "victory" as const,
			status: "won" as const,
		},
		{
			gatesCleared: 7,
			coverage: 30,
			reason: "dead" as const,
			status: "dead" as const,
		},
		{
			gatesCleared: 4,
			coverage: 17,
			reason: "abandoned" as const,
			status: "dead" as const,
		},
	];

	for (const [index, entry] of archive.entries()) {
		const answered = entry.gatesCleared * SLICE_WINDOW;
		const seedDate = pastDate(today, index + 1);
		const finishedAt = new Date(`${seedDate}T${ARCHIVED_FINISH_TIME}`);
		const [run] = await db
			.insert(runsTable)
			.values({
				user_id: userId,
				mode: "session",
				status: "finished",
				seed_date: seedDate,
				completion_reason: entry.reason,
				finished_at: finishedAt,
				victory_achieved_at: entry.reason === "victory" ? finishedAt : null,
			})
			.returning({ id: runsTable.id });

		await db.insert(runStatesTable).values({
			run_id: run.id,
			state: {
				...blank,
				status: entry.status,
				gatesCleared: entry.gatesCleared,
				coverage: entry.coverage,
				currentIndex: answered,
				headStartUnits: 0,
				accuracyBonus: 0,
				build: { ...blank.build, configs: CONFIG_LIST.slice(0, 4) },
			},
			engine_status: entry.status,
			gates_cleared: entry.gatesCleared,
			coverage: entry.coverage,
			polls_answered: answered,
		});
	}

	return archive.length;
};

const ARCHIVED_FINISH_TIME = "20:00:00";

const pastDate = (today: string, daysBack: number): string => {
	const date = new Date(`${today}T00:00:00`);
	date.setDate(date.getDate() - daysBack);
	return date.toISOString().slice(0, 10);
};

const DAY_MS = 24 * 60 * 60 * 1000;
const LEGACY_TESTER = "title-legacy-tester";
const LEGACY_ACTIVE = "title-legacy-active";
const LEGACY_BONUS_BYTES = {
	played: 256 * STORAGE_UNITS.KB,
	caughtMidClimb: STORAGE_UNITS.MB,
} as const;

const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY_MS);

const titleRowsFor = (userId: string, titleIds: readonly string[]) =>
	titleIds.map((titleId) => {
		const title = findTitleById(titleId);
		if (!title) throw new Error(`Seed names unknown title ${titleId}`);
		return {
			user_id: userId,
			title_id: title.id,
		};
	});

export const seedLegacyEra = async (): Promise<number> => {
	let granted = 0;

	for (const player of SEED_PLAYERS) {
		const legacy = player.legacyCalendarRuns;
		if (!legacy) continue;

		for (let index = 0; index < legacy.finished; index += 1) {
			await db.insert(runsTable).values({
				user_id: player.id,
				mode: "calendar",
				status: "finished",
				started_at: daysAgo(90 - index * 7),
				finished_at: daysAgo(85 - index * 7),
			});
		}

		if (legacy.active) {
			await db.insert(runsTable).values({
				user_id: player.id,
				mode: "calendar",
				status: "finished",
				completion_reason: "archived",
				started_at: daysAgo(12),
				finished_at: new Date(),
			});
		}

		const titleIds = legacy.active
			? [LEGACY_TESTER, LEGACY_ACTIVE]
			: [LEGACY_TESTER];

		await db
			.insert(userTitlesTable)
			.values(titleRowsFor(player.id, titleIds))
			.onConflictDoNothing();

		const bonusBytes = legacy.active
			? LEGACY_BONUS_BYTES.caughtMidClimb
			: LEGACY_BONUS_BYTES.played;

		await db
			.update(usersTable)
			.set({
				equipped_title_ids: sql`case when cardinality(${usersTable.equipped_title_ids}) = 0 then array[${titleIds[titleIds.length - 1]}]::text[] else ${usersTable.equipped_title_ids} end`,
				archived_storage: sql`${usersTable.archived_storage} + ${bonusBytes}`,
				legacy_bonus_bytes: bonusBytes,
			})
			.where(eq(usersTable.id, player.id));

		granted += titleIds.length;
	}

	return granted;
};
