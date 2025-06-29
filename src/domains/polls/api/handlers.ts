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
		return { success: false, error: "Failed to fetch poll" };
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
	} catch {
		return {
			success: false,
			error: "Failed to fetch poll",
		};
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
		return {
			success: false,
			error: "Failed to fetch polls",
		};
	}
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}
