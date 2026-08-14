import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getRunCommunityService } from "~/modules/run/community/application/community.service";
import { getPollSplitService } from "~/modules/run/community/application/pollSplit.service";

/** Community comparison for today's segment — only polls the viewer is past. */
export const getRunCommunity = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getRunCommunityService({ userId, date: getTodayDateString() })
		)
);

/**
 * The community split on an unanswered poll — Telemetry's product. The client
 * names the poll but earns nothing by lying about it: the service only answers
 * for polls the run has already paid a peek on.
 */
export const getPollSplit = createServerFn({ method: "GET" })
	.validator(z.object({ pollId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			getPollSplitService({ userId, pollId: data.pollId })
		)
	);
