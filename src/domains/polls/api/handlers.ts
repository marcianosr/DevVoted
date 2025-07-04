import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	createPollResponse,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import { 
	pollSubmissionSchema, 
	pollIdParamSchema,
	type PollSubmissionInput,
	type PollIdParamInput 
} from "~/domains/polls/validation/schemas";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number; userId?: string };
}) => {
	try {
		const { id, userId } = data;

		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId ? await hasUserAnsweredPoll(id, userId) : false;

		return { success: true, data: { poll, options, hasAnswered } };
	} catch (error) {
		console.error("Error fetching poll:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const getPollByIdHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	try {
		const poll = await getPollOrError(data.id);

		return {
			success: true,
			data: poll,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const getAllPollsHandler = async () => {
	try {
		const polls = await fetchAllPolls();

		return {
			success: true,
			data: polls,
		};
	} catch (error) {
		console.error("Error fetching polls:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	try {
		// Validate input data
		const validatedData = pollSubmissionSchema.parse(data);
		const { pollId, selectedOptions, userId } = validatedData;

		// Check if user has already answered this poll
		const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
		if (hasAnswered) {
			throw new Error("You have already answered this poll");
		}

		// Verify the poll exists
		const poll = await fetchPollById(pollId);

		if (!poll) {
			throw new Error("Poll not found");
		}

		// Convert string option IDs to numbers for the DB
		const selectedOptionIds = selectedOptions.map((option) =>
			Number(option)
		);

		// Create the poll response and link it to the selected options
		const result = await createPollResponse({
			pollId,
			userId,
			selectedOptionIds,
		});

		return {
			success: true,
			message: "Options submitted successfully",
			data: result,
		};
	} catch (error) {
		console.error("Error submitting poll options:", error);
		const message =
			error instanceof Error ? error.message : "Something went wrong";
		return { success: false, error: message };
	}
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}
