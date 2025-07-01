import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
} from "./queries";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	try {
		const { id } = data;

		const { poll, options } = await fetchPollByIdWithOptions(id);

		return { success: true, data: { poll, options } };
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
	data: { pollId: number; selectedOptions: string[] };
}) => {
	try {
		const { pollId, selectedOptions } = data;

		if (selectedOptions.length === 0) {
			throw new Error("Please select at least one option");
		}

		const poll = await fetchPollById(pollId);

		console.log(poll);
		if (!poll) {
			throw new Error("Poll not found");
		}

		// Here you would typically save the Options to your database
		// For example:
		// await db.insert(pollOptionssTable).values({
		//   poll_id: pollId,
		//   selected_options: selectedOptions,
		//   user_id: getUserId(), // If tracking user responses
		// });

		console.log("Saving poll Options:", { pollId, selectedOptions });

		return { success: true, message: "Options submitted successfully" };
	} catch (error) {
		console.error("Error submitting poll Options:", error);
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
