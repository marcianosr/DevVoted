import { sql } from "drizzle-orm";

import { db, client } from "~/database/db";
import {
	dailyRunPollsTable,
	dailyRunSeedsTable,
	pollCategoriesTable,
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	pollsTable,
	runPollsTable,
	runStatesTable,
	runsTable,
	userConfigUnlocksTable,
	userTitlesTable,
	userObjectiveProgressTable,
	usersTable,
} from "~/database/schema";
import {
	findTitleById,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import { insertUser } from "~/modules/account/auth/infrastructure/user.repository";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { SEED_LENGTH } from "~/modules/run/run/domain/seed.model";
import { getCategories } from "~/shared/lib/categories";
import { getTodayDateString } from "~/shared/lib/dateUtils";

import {
	createLocalAuthUser,
	deleteLocalAuthUser,
	requireServiceRoleKey,
} from "~/database/seed/authUsers";
import {
	ALL_SEEDED_USER_IDS,
	POLL_AUTHOR_IDS,
	SEED_CLIMBERS,
	SEED_PASSWORD,
	SEED_PLAYERS,
} from "~/database/seed/cast";
import { SEED_QUESTIONS } from "~/database/seed/questions";
import { SEED_OWNER_HANDLE, seedOwner } from "~/database/seed/owner";
import { hashOf } from "~/database/seed/random";
import {
	seedArchivedRuns,
	seedClimberRuns,
	seedPlayerRuns,
	seedLegacyEra,
} from "~/database/seed/runs";

const clearSeededData = async (): Promise<void> => {
	await db.delete(dailyRunPollsTable);
	await db.delete(runPollsTable);
	await db.delete(dailyRunSeedsTable);
	await db.delete(pollResponseOptionsTable);
	await db.delete(pollResponsesTable);
	await db.delete(runStatesTable);
	await db.delete(runsTable);
	await db.delete(userConfigUnlocksTable);
	await db.delete(userObjectiveProgressTable);
	await db.delete(pollOptionsTable);
	await db.delete(pollsTable);
	await db.delete(usersTable);

	await Promise.all(ALL_SEEDED_USER_IDS.map(deleteLocalAuthUser));
};

const seedPlayers = async (): Promise<number> => {
	for (const player of SEED_PLAYERS) {
		await createLocalAuthUser({
			id: player.id,
			email: player.email,
			password: SEED_PASSWORD,
		});

		await insertUser({
			id: player.id,
			email: player.email,
			displayName: player.displayName,
		});

		await db
			.update(usersTable)
			.set({
				github_username: player.githubUsername,
				photo_url: player.photoUrl,
				role: player.role,
				pinned_gate: player.pinnedGate ?? null,
				owned_swatch_ids: [...(player.ownedSwatchIds ?? [])],
				equipped_swatch_id: player.equippedSwatchId ?? null,
				peak_storage_kb: player.peakStorageKb ?? 0,
				archived_storage: player.archivedStorage ?? 0,
				equipped_title_ids: (player.ownedTitleIds ?? []).slice(
					0,
					WORN_TITLE_CAP
				),
			})
			.where(sql`${usersTable.id} = ${player.id}`);

		const titles = (player.ownedTitleIds ?? []).flatMap((titleId) => {
			const title = findTitleById(titleId);
			if (!title) throw new Error(`Seed names unknown title ${titleId}`);
			return [title];
		});
		if (titles.length > 0) {
			await db
				.insert(userTitlesTable)
				.values(
					titles.map((title) => ({
						user_id: player.id,
						title_id: title.id,
						announced_at: new Date(),
					}))
				)
				.onConflictDoNothing();
		}

		const extra = player.unlockedConfigIds.filter(
			(configId) => configId.length > 0
		);
		if (extra.length > 0) {
			await db
				.insert(userConfigUnlocksTable)
				.values(
					extra.map((configId) => ({
						user_id: player.id,
						config_id: configId,
						via_metric: null,
					}))
				)
				.onConflictDoNothing();
		}
	}

	return SEED_PLAYERS.length;
};

const seedClimbers = async (): Promise<number> => {
	await db.insert(usersTable).values(
		SEED_CLIMBERS.map((climber) => ({
			id: climber.id,
			display_name: climber.displayName,
			email: climber.email,
			github_username: climber.githubUsername,
			photo_url: climber.photoUrl ?? null,
			owned_border_ids: [climber.borderId],
			equipped_border_id: climber.borderId,
			role: "poll-editor" as const,
		}))
	);
	return SEED_CLIMBERS.length;
};

const seedCategories = async (): Promise<number> => {
	const categories = getCategories();
	await db
		.insert(pollCategoriesTable)
		.values(categories.map(({ code, name }) => ({ code, name })))
		.onConflictDoNothing({ target: pollCategoriesTable.code });
	return categories.length;
};

const seedPolls = async (): Promise<number[]> => {
	const openingTime = new Date("2020-01-01T00:00:00Z");
	const closingTime = new Date("2099-12-31T23:59:59Z");

	const rows = await db
		.insert(pollsTable)
		.values(
			SEED_QUESTIONS.map((question, index) => ({
				question: question.question,
				poll_number: index + 1,
				code_block: question.codeBlock ?? null,
				explanation: question.explanation ?? null,
				status: "published" as const,
				answer_type:
					question.correct.length > 1
						? ("multiple" as const)
						: ("single" as const),
				opening_time: openingTime,
				closing_time: closingTime,
				created_by: POLL_AUTHOR_IDS[index % POLL_AUTHOR_IDS.length],
				category_code: question.category,
			}))
		)
		.returning({ id: pollsTable.id });

	await db.insert(pollOptionsTable).values(
		SEED_QUESTIONS.flatMap((question, index) =>
			question.options.map((option, optionIndex) => ({
				poll_id: rows[index].id,
				option,
				correct: question.correct.includes(optionIndex),
				explanation: question.optionExplanations?.[optionIndex] ?? null,
			}))
		)
	);

	return rows.map((row) => row.id);
};

const seedTodaysSequence = async (
	today: string,
	pollIds: readonly number[]
): Promise<number> => {
	const todaysPollIds = pollIds.slice(0, SEED_LENGTH);
	await db.insert(dailyRunSeedsTable).values({ date: today, seed: today });
	await db.insert(dailyRunPollsTable).values(
		todaysPollIds.map((poll_id, position) => ({
			date: today,
			position,
			poll_id,
		}))
	);
	return todaysPollIds.length;
};

const COMMUNITY_POLL_COUNT = SLICE_WINDOW * 3;

const seedCommunityAnswers = async (
	today: string,
	pollIds: readonly number[],
	runByClimber: Map<string, number>
): Promise<number> => {
	const covered = pollIds.slice(0, COMMUNITY_POLL_COUNT);
	const options = await db
		.select({
			id: pollOptionsTable.id,
			poll_id: pollOptionsTable.poll_id,
			correct: pollOptionsTable.correct,
		})
		.from(pollOptionsTable);

	const optionsByPoll = new Map<number, typeof options>();
	for (const option of options) {
		optionsByPoll.set(option.poll_id, [
			...(optionsByPoll.get(option.poll_id) ?? []),
			option,
		]);
	}

	let written = 0;
	for (const climber of SEED_CLIMBERS) {
		for (const pollId of covered) {
			const pollOptions = optionsByPoll.get(pollId) ?? [];
			if (pollOptions.length === 0) continue;

			const answersCorrectly =
				hashOf(`${climber.displayName}:${pollId}`) % 100 <
				climber.accuracy * 100;
			const picked = answersCorrectly
				? pollOptions.filter((option) => option.correct)
				: pollOptions.filter((option) => !option.correct).slice(0, 1);
			if (picked.length === 0) continue;

			const [response] = await db
				.insert(pollResponsesTable)
				.values({
					poll_id: pollId,
					user_id: climber.id,
					...(runByClimber.get(climber.id) === undefined
						? {}
						: { run_id: runByClimber.get(climber.id) }),
					mode: "session",
					answer_date: today,
					answer_time_ms: 2000 + (hashOf(`${climber.id}:${pollId}`) % 18000),
					mirrored: false,
					outcome: answersCorrectly ? "correct" : "wrong",
				})
				.returning({ id: pollResponsesTable.response_id });

			await db.insert(pollResponseOptionsTable).values(
				picked.map((option) => ({
					response_id: response.id,
					option_id: option.id,
				}))
			);
			written += 1;
		}
	}

	return written;
};

const HISTORY_DAYS = 56;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HISTORY_ANSWER_MS = 3000;
const HISTORY_RUNS = 4;
const RUN_COVERAGE = [62, 52, 42, 32];
const TILT_STEPS = 5;
const TILT_CENTRE = 2;
const TILT_POINTS = 7;
const TILT_CEILING = 78;

const HISTORY_START = () => Date.now() - HISTORY_DAYS * MS_PER_DAY;
const RUN_SPAN = ((HISTORY_DAYS - 1) * MS_PER_DAY) / HISTORY_RUNS;

type SeedAnswerer = {
	readonly id: string;
	readonly displayName: string;
	readonly accuracy: number;
};

const rollFor = (answerer: SeedAnswerer, run: number, pollId: number): number =>
	(hashOf(`${pollId * 37 + run * 101}:${answerer.displayName}`) * 31 +
		hashOf(`${answerer.id}:${pollId}:${run}`)) %
	100;

const takesPoll = (
	answerer: SeedAnswerer,
	run: number,
	pollId: number
): boolean =>
	hashOf(`${answerer.id}:${run}:${pollId * 37}`) % 100 < RUN_COVERAGE[run];

const accuracyFor = (answerer: SeedAnswerer, category: string): number => {
	const tilt =
		(hashOf(`${answerer.id}:${category}`) % TILT_STEPS) - TILT_CENTRE;

	return Math.min(
		TILT_CEILING,
		Math.max(0, answerer.accuracy * 100 + tilt * TILT_POINTS)
	);
};

const dayOf = (when: Date): string => when.toISOString().slice(0, 10);

const seedAnswerHistory = async (
	pollIds: readonly number[]
): Promise<number> => {
	const answerers: readonly SeedAnswerer[] = [
		...SEED_CLIMBERS,
		...SEED_PLAYERS,
	];
	const options = await db
		.select({
			id: pollOptionsTable.id,
			poll_id: pollOptionsTable.poll_id,
			correct: pollOptionsTable.correct,
		})
		.from(pollOptionsTable);

	const categories = await db
		.select({ id: pollsTable.id, category: pollsTable.category_code })
		.from(pollsTable);

	const categoryByPoll = new Map(
		categories.map((poll) => [poll.id, poll.category])
	);

	const optionsByPoll = new Map<number, typeof options>();
	for (const option of options) {
		optionsByPoll.set(option.poll_id, [
			...(optionsByPoll.get(option.poll_id) ?? []),
			option,
		]);
	}

	const startedAt = HISTORY_START();

	const answeredAt = (run: number, position: number, taken: number): Date =>
		new Date(
			startedAt +
				run * RUN_SPAN +
				Math.round((position / Math.max(taken, 1)) * RUN_SPAN)
		);

	const sittings = answerers.flatMap((answerer) =>
		Array.from({ length: HISTORY_RUNS }, (_, run) => ({
			answerer,
			run,
			polls: pollIds.filter((pollId) => takesPoll(answerer, run, pollId)),
		}))
	);

	const runs = await db
		.insert(runsTable)
		.values(
			sittings.map(({ answerer, run }) => ({
				user_id: answerer.id,
				mode: "session" as const,
				status: "finished" as const,
				seed_date: dayOf(answeredAt(run, 0, 1)),
				completion_reason: run === HISTORY_RUNS - 1 ? "victory" : "dead",
				started_at: answeredAt(run, 0, 1),
				finished_at: answeredAt(run, 1, 1),
			}))
		)
		.returning({ id: runsTable.id });

	const answerOf = (
		answerer: SeedAnswerer,
		run: number,
		runId: number,
		pollId: number,
		position: number,
		taken: number
	) => {
		const pollOptions = optionsByPoll.get(pollId) ?? [];
		const category = categoryByPoll.get(pollId);
		if (pollOptions.length === 0 || category === undefined) return [];

		const correct =
			rollFor(answerer, run, pollId) < accuracyFor(answerer, category);
		const picked = correct
			? pollOptions.filter((option) => option.correct)
			: pollOptions.filter((option) => !option.correct).slice(0, 1);
		if (picked.length === 0) return [];

		const when = answeredAt(run, position, taken);
		return [
			{
				picked,
				row: {
					poll_id: pollId,
					user_id: answerer.id,
					run_id: runId,
					mode: "session" as const,
					answer_date: dayOf(when),
					answer_time_ms:
						HISTORY_ANSWER_MS + (hashOf(`${answerer.id}:${pollId}`) % 18000),
					mirrored: false,
					outcome: correct ? ("correct" as const) : ("wrong" as const),
					created_at: when,
				},
			},
		];
	};

	const answers = sittings.flatMap(({ answerer, run, polls }, sitting) =>
		polls.flatMap((pollId, position) =>
			answerOf(answerer, run, runs[sitting].id, pollId, position, polls.length)
		)
	);

	if (answers.length === 0) return 0;

	const written = await db
		.insert(pollResponsesTable)
		.values(answers.map((answer) => answer.row))
		.returning({ id: pollResponsesTable.response_id });

	await db.insert(pollResponseOptionsTable).values(
		answers.flatMap((answer, index) =>
			answer.picked.map((option) => ({
				response_id: written[index].id,
				option_id: option.id,
			}))
		)
	);

	return written.length;
};

const seedObjectiveProgress = async (): Promise<void> => {
	await db.insert(userObjectiveProgressTable).values([
		{ user_id: SEED_PLAYERS[0].id, metric: "gates-cleared", count: 24 },
		{ user_id: SEED_PLAYERS[0].id, metric: "polls-answered", count: 180 },
		{ user_id: SEED_PLAYERS[1].id, metric: "gates-cleared", count: 6 },
		{ user_id: SEED_PLAYERS[2].id, metric: "polls-answered", count: 45 },
	]);
};

const seedDatabase = async (): Promise<void> => {
	requireServiceRoleKey();
	const today = getTodayDateString();

	console.info(`\n🌱 Seeding DevVoted for ${today}\n`);

	await clearSeededData();
	console.info("🗑️  Cleared previously seeded data");

	const players = await seedPlayers();
	console.info(`👤 ${players} playable accounts`);

	const owner = await seedOwner();
	console.info(
		owner === null
			? `🙋 no local account for ${SEED_OWNER_HANDLE}; log in once, then seed again`
			: `🙋 ${owner.displayName} owns a spread of swatches`
	);

	const climbers = await seedClimbers();
	console.info(`🧗 ${climbers} community climbers`);

	const categories = await seedCategories();
	console.info(`🏷️  ${categories} categories`);

	const pollIds = await seedPolls();
	console.info(`❓ ${pollIds.length} published polls`);

	const sequence = await seedTodaysSequence(today, pollIds);
	console.info(`📅 ${sequence} polls in today's sequence`);

	const climberRuns = await seedClimberRuns(today);
	console.info(`🏃 ${climberRuns.size} live climber runs`);

	const archived = await seedArchivedRuns(SEED_PLAYERS[0].id, today);
	console.info(
		`📦 ${archived} archived runs for ${SEED_PLAYERS[0].displayName}`
	);

	const legacy = await seedLegacyEra();
	console.info(`🗄️  ${legacy} legacy titles granted off calendar-era runs`);

	const history = await seedAnswerHistory(pollIds);
	console.info(`📜 ${history} backdated answers across every category`);

	const answers = await seedCommunityAnswers(today, pollIds, climberRuns);
	console.info(`💬 ${answers} community answers`);

	const playerRuns = await seedPlayerRuns(today);
	console.info(
		`🎮 today's runs: ${playerRuns.started.join(", ")} climbing · ${playerRuns.fallen.join(", ")} fell`
	);

	await seedObjectiveProgress();
	console.info("🎯 objective progress");

	console.info(`\n✅ Done. Log in with password "${SEED_PASSWORD}":\n`);
	for (const player of SEED_PLAYERS) {
		console.info(
			`   ${player.email.padEnd(22)} ${String(player.unlockedConfigIds.length).padStart(2)} configs — ${player.buildStyle}`
		);
	}
	console.info("");
};

seedDatabase()
	.then(() => client.end())
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Seed failed:", error.message ?? error);
		process.exit(1);
	});
