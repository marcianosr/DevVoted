import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { db } from "~/database/db";
import {
	dailyPollsTable,
	pollHistoryTable,
	pollResponsesTable,
	runsTable,
} from "~/database/schema";
import { getTodayDateString } from "~/lib/dateUtils";
import { getAuthenticatedUserId } from "~/utils/authorization";

export const resetDailyPollForE2E = createServerFn({ method: "POST" }).handler(
	async () => {
		if (process.env.NODE_ENV === "production") {
			throw new Error("Not available in production");
		}

		const userId = await getAuthenticatedUserId();
		const today = getTodayDateString();

		const [dailyPoll] = await db
			.select()
			.from(dailyPollsTable)
			.where(eq(dailyPollsTable.date, today))
			.limit(1);

		if (!dailyPoll?.poll_id) return;

		const pollId = dailyPoll.poll_id;

		const [activeRun] = await db
			.select({ id: runsTable.id })
			.from(runsTable)
			.where(and(eq(runsTable.user_id, userId), eq(runsTable.status, "active")))
			.limit(1);

		await db.transaction(async (tx) => {
			await tx
				.delete(pollResponsesTable)
				.where(
					and(
						eq(pollResponsesTable.poll_id, pollId),
						eq(pollResponsesTable.user_id, userId),
						eq(pollResponsesTable.answer_date, today)
					)
				);

			if (activeRun) {
				await tx
					.delete(pollHistoryTable)
					.where(
						and(
							eq(pollHistoryTable.run_id, activeRun.id),
							eq(pollHistoryTable.poll_id, pollId)
						)
					);

				await tx
					.update(runsTable)
					.set({ shop_interacted_date: null, shop_skipped_date: null })
					.where(eq(runsTable.id, activeRun.id));
			}
		});
	}
);
