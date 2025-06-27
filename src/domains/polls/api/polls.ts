import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
} from "@/src/domains/polls/api/queries";

export const getPollByIdWithOptions = createServerFn()
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;

			const { poll, options } = await fetchPollByIdWithOptions(id);

			return toSuccess({ poll, options });
		} catch (error) {
			console.error("Error fetching poll:", error);
			return toError("Failed to fetch poll");
		}
	});

export const getPollById = createServerFn()
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;

			const poll = await getPollOrError(id);

			return toSuccess(poll);
		} catch (error) {
			console.error("Error fetching poll:", error);
			return toError("Failed to fetch poll");
		}
	});

export const getAllPolls = createServerFn().handler(async () => {
	try {
		const polls = await fetchAllPolls();

		return {
			success: true,
			data: polls,
		};
	} catch (error) {
		console.error("Error fetching polls:", error);
		return {
			success: false,
			error: "Failed to fetch polls",
		};
	}
});

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}

function toSuccess<T>(data: T) {
	return { success: true, data };
}

function toError(error: string) {
	return { success: false, error };
}
