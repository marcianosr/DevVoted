import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getCommunityStatsHandler } from "~/domains/polls/api/dailyPoll.handlers";

export const getCommunityStats = createServerFn({ method: "GET" })
	.inputValidator(z.object({ pollId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const result = await getCommunityStatsHandler({ data });

		if (!result || !result.success) {
			throw new Error("Failed to get community stats");
		}

		return result.data;
	});
