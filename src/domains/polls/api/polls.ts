import { createServerFn } from "@tanstack/react-start";
import { pollFactory } from "@/src/domains/polls/api/schema";
import { z } from "zod";
import {
	fetchAllPolls,
	fetchPollById,
	insertPoll,
} from "@/src/domains/polls/api/queries";

export const getPollById = createServerFn()
	.validator(z.object({ id: z.number().int().positive() }))
	.handler(async ({ data }) => {
		try {
			const { id } = data;

			const poll = await fetchPollById(id);

			if (!poll) {
				return {
					success: false,
					error: "Poll not found",
				};
			}

			return {
				success: true,
				data: poll,
			};
		} catch (error) {
			console.error("Error fetching poll:", error);
			return {
				success: false,
				error: "Failed to fetch poll",
			};
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

const createPollInputSchema = z.object({
	question: z.string().min(1),
	status: z.enum(["draft", "needs-revision", "open", "closed", "archived"]),
	answerType: z.enum(["single", "multiple"]),
	openingTime: z.date(),
	closingTime: z.date(),
	createdBy: z.string().uuid(),
	categoryCode: z.string().min(1),
});

export const createPoll = createServerFn({ method: "POST" })
	.validator(createPollInputSchema)
	.handler(async ({ data }) => {
		try {
			const result = await insertPoll({
				...data,
				id: 0, // Will be assigned by database
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			if (!result.length) {
				return {
					success: false,
					error: "Failed to create poll",
				};
			}

			// Convert the newly created record back to a DTO
			const newPoll = pollFactory.toDTO(result[0]);

			return {
				success: true,
				data: newPoll,
			};
		} catch (error) {
			console.error("Error creating poll:", error);
			return {
				success: false as const,
				error: "Failed to create poll",
			};
		}
	});
