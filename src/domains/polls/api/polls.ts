import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	getDailyPollHandler,
	postPollOptionsHandler,
	getAllPollsWithUserStatsHandler,
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

export const getDailyPoll = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			date: z.string().optional(),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		return getDailyPollHandler({ data: { ...data, userId } });
	});

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

export const getAllPollsWithUserStats = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			userId: z.string(),
		})
	)
	.handler(async ({ data }) => getAllPollsWithUserStatsHandler({ data }));
