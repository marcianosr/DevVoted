import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/src/database/db";
import {
	pollOptionsTable,
	pollResponseOptionsTable,
	pollResponsesTable,
	usersTable,
} from "@/src/database/schema";
import { getOrCreateDailyRunSeed } from "~/modules/run/api/queries";
import { SLICE_WINDOW } from "~/modules/run/rules.model";

// ─── Kanto trainer roster ─────────────────────────────────────────────────────
// Trainers "answer" today's seed polls so /run/community has a town to show in
// local dev. Session responses only (mode: "session", run_id null) — exactly
// the rows the community aggregation reads. Roster mirrors the proto-run rig's
// simulated community. Rerunnable daily: it no-ops if today is already seeded.

type Trainer = { id: string; displayName: string; accuracy: number };

const trainerUUID = (index: number): string =>
	`ca7050ca-ca70-4ca7-8ca7-${index.toString(16).padStart(12, "0")}`;

const TRAINERS: readonly Trainer[] = [
	{ id: trainerUUID(1), displayName: "Gary Oak", accuracy: 0.9 },
	{ id: trainerUUID(2), displayName: "Lance", accuracy: 0.8 },
	{ id: trainerUUID(3), displayName: "Sabrina", accuracy: 0.7 },
	{ id: trainerUUID(4), displayName: "Erika", accuracy: 0.6 },
	{ id: trainerUUID(5), displayName: "Misty", accuracy: 0.5 },
	{ id: trainerUUID(6), displayName: "Brock", accuracy: 0.45 },
	{ id: trainerUUID(7), displayName: "Ash Ketchum", accuracy: 0.35 },
];

const slugifyEmail = (name: string): string =>
	`${name.toLowerCase().replace(/\s+/g, ".")}@kanto.dev`;

// Deterministic picks: rerunning the seed on the same day's polls yields the
// same votes, so the community page is stable across db:refresh cycles.
const hashOf = (text: string): number =>
	[...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);

type OptionRow = typeof pollOptionsTable.$inferSelect;

const pickOptionIds = (
	trainer: Trainer,
	pollId: number,
	options: OptionRow[]
): number[] => {
	const roll = hashOf(`${trainer.displayName}:${pollId}`) % 100;
	const right = options.filter((option) => option.correct);
	const wrong = options.filter((option) => !option.correct);
	if (right.length === 0) return [];
	if (roll < trainer.accuracy * 100) return right.map((option) => option.id);
	// Multi-answer polls get a partial branch: one right pick plus a stray.
	if (right.length > 1 && roll % 2 === 0)
		return [right[0].id, ...(wrong[0] ? [wrong[0].id] : [])];
	if (wrong.length === 0) return right.map((option) => option.id);
	return [wrong[roll % wrong.length].id];
};

const ensureTrainerUsers = async (): Promise<void> => {
	for (const trainer of TRAINERS) {
		const existing = await db
			.select({ id: usersTable.id })
			.from(usersTable)
			.where(eq(usersTable.id, trainer.id));
		if (existing.length > 0) continue;
		await db.insert(usersTable).values({
			id: trainer.id,
			display_name: trainer.displayName,
			email: slugifyEmail(trainer.displayName),
			role: "user",
		});
		console.log(`✅ Created trainer: ${trainer.displayName}`);
	}
};

const alreadySeededToday = async (today: string): Promise<boolean> => {
	const existing = await db
		.select({ id: pollResponsesTable.response_id })
		.from(pollResponsesTable)
		.where(
			and(
				inArray(
					pollResponsesTable.user_id,
					TRAINERS.map((trainer) => trainer.id)
				),
				eq(pollResponsesTable.answer_date, today),
				eq(pollResponsesTable.mode, "session")
			)
		)
		.limit(1);
	return existing.length > 0;
};

async function seedCommunityDay() {
	const today = new Date().toISOString().slice(0, 10);
	const refresh = process.argv.includes("--refresh");
	console.log(`🏘️  Seeding community answers for ${today}...\n`);

	await ensureTrainerUsers();

	if (await alreadySeededToday(today)) {
		if (!refresh) {
			console.log(
				"ℹ️ Trainers already answered today. Skipping (--refresh redoes the day)."
			);
			return;
		}
		// Response options cascade with their responses.
		await db.delete(pollResponsesTable).where(
			and(
				inArray(
					pollResponsesTable.user_id,
					TRAINERS.map((trainer) => trainer.id)
				),
				eq(pollResponsesTable.answer_date, today),
				eq(pollResponsesTable.mode, "session")
			)
		);
		console.log("♻️  Cleared today's trainer answers for a refresh.");
	}

	// The same generator the game uses, so trainer answers land on exactly the
	// polls a real run meets today.
	const sequence = await getOrCreateDailyRunSeed(today);
	const todaysPollIds = sequence.slice(0, SLICE_WINDOW);
	if (todaysPollIds.length === 0) {
		console.log("⚠️ No published polls — run db:seed first.");
		return;
	}

	const options = await db
		.select()
		.from(pollOptionsTable)
		.where(inArray(pollOptionsTable.poll_id, todaysPollIds));
	const optionsByPoll = new Map<number, OptionRow[]>();
	for (const option of options) {
		const bucket = optionsByPoll.get(option.poll_id) ?? [];
		optionsByPoll.set(option.poll_id, [...bucket, option]);
	}

	for (const trainer of TRAINERS) {
		let answered = 0;
		for (const pollId of todaysPollIds) {
			const picked = pickOptionIds(
				trainer,
				pollId,
				optionsByPoll.get(pollId) ?? []
			);
			if (picked.length === 0) continue;
			const [response] = await db
				.insert(pollResponsesTable)
				.values({
					poll_id: pollId,
					user_id: trainer.id,
					mode: "session",
					answer_date: today,
					// 4s–2m, deterministic — feeds the "fastest answer" standout.
					answer_time_ms:
						4_000 +
						(hashOf(`${trainer.displayName}:${pollId}:ms`) % 116) * 1_000,
				})
				.returning({ response_id: pollResponsesTable.response_id });
			await db.insert(pollResponseOptionsTable).values(
				picked.map((optionId) => ({
					response_id: response.response_id,
					option_id: optionId,
				}))
			);
			answered += 1;
		}
		console.log(`⚡ ${trainer.displayName} answered ${answered} polls`);
	}
}

seedCommunityDay()
	.then(() => {
		console.log("\n✨ Community seeding complete\n");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Error seeding community:", error);
		process.exit(1);
	});
