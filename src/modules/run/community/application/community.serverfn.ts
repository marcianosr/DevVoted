import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getRunCommunityService } from "~/modules/run/community/application/community.service";
import { getPollSplitService } from "~/modules/run/community/application/pollSplit.service";

export const getRunCommunity = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getRunCommunityService({ userId, date: getTodayDateString() })
		)
);

export const getPollSplit = createServerFn({ method: "GET" })
	.validator(z.object({ pollId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			getPollSplitService({ userId, pollId: data.pollId })
		)
	);
