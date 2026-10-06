import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	acknowledgeApprovals,
	editPoll,
	getApprovalNotice,
	reviewPoll,
	suggestPoll,
} from "~/modules/polls/authoring/application/authoring.service";
import {
	createPollWithOptionsSchema,
	updatePollSchema,
} from "~/modules/polls/authoring/application/poll.validation";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

export const createPoll = createServerFn({ method: "POST" })
	.validator(createPollWithOptionsSchema)
	.handler(({ data }) =>
		withAuthenticatedUser((session) => suggestPoll(session, data))
	);

export const updatePoll = createServerFn({ method: "POST" })
	.validator(updatePollSchema)
	.handler(({ data }) =>
		withAuthenticatedUser((session) => editPoll(session, data))
	);

export const markPollReviewed = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(({ data }) =>
		withAuthenticatedUser((session) => reviewPoll(session, data.id))
	);

export const getPollApprovalNotice = createServerFn({ method: "GET" }).handler(
	() => withAuthenticatedUser((session) => getApprovalNotice(session))
);

export const acknowledgePollApprovals = createServerFn({ method: "POST" })
	.validator(z.object({ pollIds: z.array(z.number().int().positive()) }))
	.handler(({ data }) =>
		withAuthenticatedUser(({ userId }) =>
			acknowledgeApprovals(userId, data.pollIds)
		)
	);
