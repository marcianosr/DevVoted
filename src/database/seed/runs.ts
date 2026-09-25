import { eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	runStatesTable,
	runsTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import {
	findTitleById,
	isExclusive,
} from "~/modules/account/profile/domain/title.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { createRun } from "~/modules/run/run/domain/run.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";

import type { SeedClimber } from "~/database/seed/cast";
import { SEED_CLIMBERS, SEED_PLAYERS } from "~/database/seed/cast";
import { hashOf } from "~/database/seed/random";

/**
 * A climber's answer history, shaped by their accuracy so "longest streak" has
 * something to rank. `index * 37` because hashOf increments with its input:
 * plain indices hand back consecutive values, which lands every correct answer
 * in one block and invents a run-long streak at 60% accuracy.
 */
const historyFor = (climber: SeedClimber, count: number): AnsweredPoll[] =>
	Array.from({ length: count }, (_, index) => ({
		id: `seed-${climber.id}-${index}`,
		question: "",
		category: "js" as const,
		outcome:
			hashOf(`${climber.displayName}:outcome:${index * 37}`) % 100 <
			climber.accuracy * 100
				? ("correct" as const)
				: ("wrong" as const),
		picked: [],
	}));

/**
 * One run per climber, parked at a known depth. Nothing here has to be a
 * plausible game history — only a valid snapshot the community board can read.
 * The denormalized columns matter as much as the blob: the climb map reads them
 * without opening the JSON.
 */
export const seedClimberRuns = async (today: string): Promise<number> => {
	const blank = toRunSnapshot(createRun([], []));

	for (const climber of SEED_CLIMBERS) {
		const { gatesCleared, pollsIntoGate, fell = false } = climber.climb;
		const { configs, coverageUnits, configsLost, startedAtGate } =
			climber.climb;
		const answeredCount = gatesCleared * SLICE_WINDOW + pollsIntoGate;

		const [run] = await db
			.insert(runsTable)
			.values({
				user_id: climber.id,
				mode: "session",
				status: fell ? "finished" : "active",
				seed_date: today,
				completion_reason: fell ? "dead" : null,
				finished_at: fell ? new Date() : null,
			})
			.returning({ id: runsTable.id });

		await db.insert(runStatesTable).values({
			run_id: run.id,
			state: {
				...blank,
				status: fell ? "dead" : "answering",
				gatesCleared,
				coverage: coverageUnits,
				currentIndex: answeredCount,
				allAnswered: historyFor(climber, answeredCount),
				configsLost,
				startedAtGate,
				build: { ...blank.build, configs: CONFIG_LIST.slice(0, configs) },
				window: {
					...blank.window,
					answered: pollsIntoGate,
					correct: Math.round(pollsIntoGate * climber.accuracy),
				},
			},
			engine_status: fell ? "dead" : "answering",
			gates_cleared: gatesCleared,
			coverage: coverageUnits,
			polls_answered: answeredCount,
		});
	}

	return SEED_CLIMBERS.length;
};

/**
 * Finished runs for a player, so the archive permalink, the Dex Runs tab and the
 * run-over screen all have real rows to read rather than an empty state.
 */
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
		const [run] = await db
			.insert(runsTable)
			.values({
				user_id: userId,
				mode: "session",
				status: "finished",
				// Past days: an archived run must not collide with today's live run,
				// which is unique per (user_id, seed_date) for mode 'session'.
				seed_date: pastDate(today, index + 1),
				completion_reason: entry.reason,
				finished_at: new Date(),
				victory_achieved_at: entry.reason === "victory" ? new Date() : null,
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
				bankedUnits: entry.coverage,
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

const pastDate = (today: string, daysBack: number): string => {
	const date = new Date(`${today}T00:00:00`);
	date.setDate(date.getDate() - daysBack);
	return date.toISOString().slice(0, 10);
};

const DAY_MS = 24 * 60 * 60 * 1000;
const LEGACY_TESTER = "title-legacy-tester";
const LEGACY_ACTIVE = "title-legacy-active";

const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY_MS);

const titleRowsFor = (userId: string, titleIds: readonly string[]) =>
	titleIds.map((titleId) => {
		const title = findTitleById(titleId);
		if (!title) throw new Error(`Seed names unknown title ${titleId}`);
		return {
			user_id: userId,
			title_id: title.id,
			exclusive: isExclusive(title),
		};
	});

/**
 * The calendar era as the grant migration leaves it (ADR-111): every run closed,
 * the one that was still open when the rebuild landed marked archived, and the
 * titles the two predicates read off those rows. `announced_at` is left null on
 * purpose — that is what puts the notice on screen at first login.
 *
 * This exists because migrations never run locally (ADR-012 has db:push build
 * the schema and CI apply the SQL), so without it nothing here is demoable.
 */
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

		// coalesce, as the migration does: worn at once by an account wearing
		// nothing, never over a title somebody already chose.
		await db
			.update(usersTable)
			.set({
				equipped_title_id: sql`coalesce(${usersTable.equipped_title_id}, ${titleIds[titleIds.length - 1]})`,
			})
			.where(eq(usersTable.id, player.id));

		granted += titleIds.length;
	}

	return granted;
};
