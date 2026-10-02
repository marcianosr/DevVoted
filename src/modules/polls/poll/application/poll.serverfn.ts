import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
	listPollsFor,
	pollDetailFor,
} from "~/modules/polls/poll/application/poll.service";
import {
	countPublishedPolls,
	fetchPollCreators,
} from "~/modules/polls/poll/infrastructure/poll.repository";
import { withAuthenticatedUser } from "~/shared/utils/authorization";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export const getPollDetail = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(({ data }) =>
		withAuthenticatedUser((session) => pollDetailFor(session, data.id))
	);

export const getPollList = createServerFn({ method: "GET" }).handler(() =>
	withAuthenticatedUser((session) => listPollsFor(session))
);

export const getPublishedPollCount = createServerFn({ method: "GET" }).handler(
	() => handleApiOperation(countPublishedPolls, "getPublishedPollCount")
);

export const getPollCreators = createServerFn({ method: "GET" }).handler(() =>
	withAuthenticatedUser(() =>
		handleApiOperation(fetchPollCreators, "getPollCreators")
	)
);
