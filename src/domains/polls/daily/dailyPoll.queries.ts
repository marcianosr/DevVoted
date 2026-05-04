import { eq } from "drizzle-orm";

import { db } from "~/database/db";
import { dailyPollsTable, pollsTable } from "~/database/schema";
import { Poll, pollFactory } from "~/domains/polls/models/poll";
import { fetchPollById } from "~/domains/polls/api/poll.queries";
import {
	calculateCategoryWeights,
	type CategoryWeights,
} from "~/domains/polls/services/categoryWeight.service";
import { getAllActiveConfigIds } from "~/domains/runs/api/queries";

export const snapshotDailyWeights = async (
	date: string,
	weights: CategoryWeights
): Promise<void> => {
	await db
		.insert(dailyPollsTable)
		.values({
			date,
			poll_id: null,
			category_weights: weights,
		})
		.onConflictDoNothing();
};

export const getOrCreateDailyPoll = async (
	date: string,
	selectPollFn: (polls: Poll[]) => Poll | null,
	selectWeightedPollFn?: (
		polls: { id: number; categoryCode: string }[],
		weights: CategoryWeights
	) => { id: number; categoryCode: string } | null
): Promise<Poll | null> => {
	const [existingDailyPoll] = await db
		.select()
		.from(dailyPollsTable)
		.where(eq(dailyPollsTable.date, date))
		.limit(1);

	if (existingDailyPoll?.poll_id) {
		return fetchPollById(existingDailyPoll.poll_id);
	}

	return await db.transaction(async (tx) => {
		const [existingInTx] = await tx
			.select()
			.from(dailyPollsTable)
			.where(eq(dailyPollsTable.date, date))
			.limit(1);

		if (existingInTx?.poll_id) {
			return fetchPollById(existingInTx.poll_id);
		}

		const pollRecords = await tx
			.select({ id: pollsTable.id, categoryCode: pollsTable.category_code })
			.from(pollsTable)
			.where(eq(pollsTable.status, "published"))
			.orderBy(pollsTable.id);

		if (pollRecords.length === 0) {
			return null;
		}

		let selectedPoll: { id: number; categoryCode: string } | null = null;

		let storedWeights =
			existingInTx?.category_weights as CategoryWeights | null;

		if (!storedWeights) {
			const allActiveConfigIds = await getAllActiveConfigIds();
			storedWeights = calculateCategoryWeights(allActiveConfigIds);
		}

		if (selectWeightedPollFn) {
			selectedPoll = selectWeightedPollFn(pollRecords, storedWeights);
		} else {
			const pollsForSelection = pollRecords.map((r) => ({ id: r.id }) as Poll);
			const result = selectPollFn(pollsForSelection);
			if (result) {
				const pollWithCategory = pollRecords.find((p) => p.id === result.id);
				if (pollWithCategory) {
					selectedPoll = pollWithCategory;
				}
			}
		}

		if (!selectedPoll) {
			return null;
		}

		if (existingInTx) {
			await tx
				.update(dailyPollsTable)
				.set({
					poll_id: selectedPoll.id,
					category_weights: existingInTx.category_weights ?? storedWeights,
				})
				.where(eq(dailyPollsTable.date, date));
		} else {
			await tx.insert(dailyPollsTable).values({
				date,
				poll_id: selectedPoll.id,
				category_weights: storedWeights,
			});
		}

		const [fullPollRecord] = await tx
			.select()
			.from(pollsTable)
			.where(eq(pollsTable.id, selectedPoll.id));

		return pollFactory.toDTO(fullPollRecord);
	});
};
