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
	isExclusive,
} from "~/modules/account/profile/domain/title.model";
import { insertUser } from "~/modules/account/auth/infrastructure/user.repository";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
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
import { hashOf } from "~/database/seed/random";
import {
	seedArchivedRuns,
	seedClimberRuns,
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
				role: player.role,
				pinned_gate: player.pinnedGate ?? null,
				owned_swatch_ids: [...(player.ownedSwatchIds ?? [])],
				peak_storage_kb: player.peakStorageKb ?? 0,
				archived_storage: player.archivedStorage ?? 0,
				equipped_title_id: player.ownedTitleIds?.[0] ?? null,
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
						exclusive: isExclusive(title),
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
			photo_url: climber.photoUrl,
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
			}))
		)
	);

	return rows.map((row) => row.id);
};

const seedTodaysSequence = async (
	today: string,
	pollIds: readonly number[]
): Promise<number> => {
	await db.insert(dailyRunSeedsTable).values({ date: today, seed: today });
	await db
		.insert(dailyRunPollsTable)
		.values(
			pollIds.map((poll_id, position) => ({ date: today, position, poll_id }))
		);
	return pollIds.length;
};

const COMMUNITY_POLL_COUNT = SLICE_WINDOW * 3;

const seedCommunityAnswers = async (
	today: string,
	pollIds: readonly number[]
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
const HISTORY_PASSES = 2;

type SeedAnswerer = {
	readonly id: string;
	readonly displayName: string;
	readonly accuracy: number;
};

const rollFor = (
	answerer: SeedAnswerer,
	pass: number,
	pollId: number
): number =>
	(hashOf(`${pollId * 37 + pass}:${answerer.displayName}`) * 31 +
		hashOf(`${answerer.id}:${pollId}:${pass}`)) %
	100;

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

	const optionsByPoll = new Map<number, typeof options>();
	for (const option of options) {
		optionsByPoll.set(option.poll_id, [
			...(optionsByPoll.get(option.poll_id) ?? []),
			option,
		]);
	}

	const sittings = Array.from({ length: HISTORY_PASSES }, (_, pass) => pass);
	const answerCount = HISTORY_PASSES * pollIds.length;

	const answeredAt = (position: number): Date =>
		new Date(
			Date.now() -
				HISTORY_DAYS * MS_PER_DAY +
				Math.round((position / answerCount) * HISTORY_DAYS * MS_PER_DAY)
		);

	const answerOf = (
		answerer: SeedAnswerer,
		pass: number,
		pollId: number,
		position: number
	) => {
		const pollOptions = optionsByPoll.get(pollId) ?? [];
		if (pollOptions.length === 0) return [];

		const correct = rollFor(answerer, pass, pollId) < answerer.accuracy * 100;
		const picked = correct
			? pollOptions.filter((option) => option.correct)
			: pollOptions.filter((option) => !option.correct).slice(0, 1);
		if (picked.length === 0) return [];

		const when = answeredAt(position);
		return [
			{
				picked,
				row: {
					poll_id: pollId,
					user_id: answerer.id,
					mode: "calendar" as const,
					answer_date: when.toISOString().slice(0, 10),
					answer_time_ms:
						HISTORY_ANSWER_MS + (hashOf(`${answerer.id}:${pollId}`) % 18000),
					mirrored: false,
					outcome: correct ? ("correct" as const) : ("wrong" as const),
					created_at: when,
				},
			},
		];
	};

	const answers = answerers.flatMap((answerer) =>
		sittings.flatMap((pass) =>
			pollIds.flatMap((pollId, index) =>
				answerOf(answerer, pass, pollId, pass * pollIds.length + index)
			)
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

	const climbers = await seedClimbers();
	console.info(`🧗 ${climbers} community climbers`);

	const categories = await seedCategories();
	console.info(`🏷️  ${categories} categories`);

	const pollIds = await seedPolls();
	console.info(`❓ ${pollIds.length} published polls`);

	const sequence = await seedTodaysSequence(today, pollIds);
	console.info(`📅 ${sequence} polls in today's sequence`);

	const runs = await seedClimberRuns(today);
	console.info(`🏃 ${runs} live climber runs`);

	const archived = await seedArchivedRuns(SEED_PLAYERS[0].id, today);
	console.info(
		`📦 ${archived} archived runs for ${SEED_PLAYERS[0].displayName}`
	);

	const legacy = await seedLegacyEra();
	console.info(`🗄️  ${legacy} legacy titles granted off calendar-era runs`);

	const history = await seedAnswerHistory(pollIds);
	console.info(`📜 ${history} backdated answers across every category`);

	const answers = await seedCommunityAnswers(today, pollIds);
	console.info(`💬 ${answers} community answers`);

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
