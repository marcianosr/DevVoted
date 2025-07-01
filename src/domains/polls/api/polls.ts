import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	postPollOptionsHandler,
} from "./handlers";

export const getPollByIdWithOptions = createServerFn()
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => getPollByIdWithOptionsHandler({ data }));

export const getPollById = createServerFn()
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => getPollByIdHandler({ data }));

export const getAllPolls = createServerFn().handler(async () =>
	getAllPollsHandler()
);

export const postPollOptions = createServerFn()
	.validator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()).min(1),
		})
	)
	.handler(async ({ data }) => postPollOptionsHandler({ data }));
