import { createServerFn } from "@tanstack/react-start";

import {
	editPoll,
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
