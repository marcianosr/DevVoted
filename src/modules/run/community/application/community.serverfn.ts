import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getRunCommunityService } from "~/modules/run/community/application/community.service";
import {
	getApprovalSlotsService,
	submitCrowdPickService,
} from "~/modules/run/community/application/approval.service";
import { getPollSplitService } from "~/modules/run/community/application/pollSplit.service";
import { lootFallenRunService } from "~/modules/run/community/application/loot.service";

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

export const getApprovalSlots = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) => getApprovalSlotsService({ userId }))
);

export const submitCrowdPick = createServerFn({ method: "POST" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			submitCrowdPickService({ userId, date: getTodayDateString() })
		)
);

export const lootFallenRun = createServerFn({ method: "POST" })
	.validator(z.object({ runId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			lootFallenRunService({
				userId,
				date: getTodayDateString(),
				fallenRunId: data.runId,
			})
		)
	);
