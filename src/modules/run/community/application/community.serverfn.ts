import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import {
	getReviewPollsService,
	getRunCommunityService,
} from "~/modules/run/community/application/community.service";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	getApprovalSlotsService,
	submitCrowdPickService,
} from "~/modules/run/community/application/approval.service";
import { getPollSplitService } from "~/modules/run/community/application/pollSplit.service";
import { lootFallenRunService } from "~/modules/run/community/application/loot.service";

export const getRunCommunity = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) =>
			getRunCommunityService({ userId, date: getTodayDateString() })
		)
);

export const getReviewPolls = createServerFn({ method: "GET" })
	.validator(
		z
			.object({
				pollIds: z.array(z.number().int().positive()).max(SLICE_WINDOW),
			})
			.strict()
	)
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			getReviewPollsService({ userId, pollIds: data.pollIds })
		)
	);

export const getPollSplit = createServerFn({ method: "GET" })
	.validator(z.object({ pollId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			getPollSplitService({ userId, pollId: data.pollId })
		)
	);

export const getApprovalSlots = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser(({ userId }) => getApprovalSlotsService({ userId }))
);

export const submitCrowdPick = createServerFn({ method: "POST" }).handler(
	async () =>
		withAuthenticatedUser(({ userId, isGuest }) =>
			submitCrowdPickService({ userId, date: getTodayDateString(), isGuest })
		)
);

export const lootFallenRun = createServerFn({ method: "POST" })
	.validator(z.object({ runId: z.number().int().positive() }).strict())
	.handler(async ({ data }) =>
		withAuthenticatedUser(({ userId, isGuest }) =>
			lootFallenRunService({
				userId,
				isGuest,
				date: getTodayDateString(),
				fallenRunId: data.runId,
			})
		)
	);
