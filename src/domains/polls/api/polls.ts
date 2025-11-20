import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	getDailyPollHandler,
	postPollOptionsHandler,
	getPollsSeenInRunHandler,
} from "./handlers";
import { getAuthenticatedUserId } from "~/utils/authorization";

export const getPollByIdWithOptions = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			id: z.number().int().positive(),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return getPollByIdWithOptionsHandler({ data: { ...data, userId } });
	});

export const getPollById = createServerFn()
	.inputValidator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => getPollByIdHandler({ data }));

export const getAllPolls = createServerFn().handler(async () =>
	getAllPollsHandler()
);

export const getDailyPoll = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getDailyPollHandler({ data: { userId } });
	}
);

export const postPollOptions = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return postPollOptionsHandler({
			data: { ...data, userId },
		});
	});

export const getPollsSeenInRun = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getAuthenticatedUserId();
		return getPollsSeenInRunHandler({ data: { userId } });
	}
);
