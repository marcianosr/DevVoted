import { db } from "~/database/db";
import { runStatesTable, runsTable } from "~/database/schema";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { createRun } from "~/modules/run/run/domain/run.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { toRunSnapshot } from "~/modules/run/run/domain/runSnapshot.model";

import type { SeedClimber } from "~/database/seed/cast";
import { SEED_CLIMBERS } from "~/database/seed/cast";
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
