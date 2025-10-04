import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	getDailyPollHandler,
	postPollOptionsHandler,
} from "./handlers";

export const getPollByIdWithOptions = createServerFn()
	.inputValidator(
		z.object({
			id: z.number().int().positive(),
			userId: z.string().optional(),
		})
	)
	.handler(async ({ data }) => getPollByIdWithOptionsHandler({ data }));

export const getPollById = createServerFn()
	.inputValidator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => getPollByIdHandler({ data }));

export const getAllPolls = createServerFn().handler(async () =>
	getAllPollsHandler()
);

export const getDailyPoll = createServerFn()
	.inputValidator(
		z.object({
			userId: z.string().optional(),
			date: z.string().optional(),
		})
	)
	.handler(async ({ data }) => getDailyPollHandler({ data }));

export const postPollOptions = createServerFn()
	.inputValidator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
			userId: z.string(),
		})
	)
	.handler(async ({ data }) => postPollOptionsHandler({ data }));
