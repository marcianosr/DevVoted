import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import { getDailyPollWithOptions } from "~/domains/polls/services/dailyPoll.service";
import {
	pollSubmissionSchema,
	type PollSubmissionInput,
} from "~/domains/polls/validation/schemas";
import { processPollAnswer } from "~/domains/polls/services/processPollAnswer.service";
import { handleApiOperation } from "~/utils/errorHandling";
import { db } from "~/database/db";
import { pollOptionsTable } from "~/database/schema";
import { eq, and, inArray } from "drizzle-orm";

export const getPollByIdWithOptionsHandler = async ({
	data,
}: {
	data: { id: number; userId?: string };
}) => {
	return handleApiOperation(async () => {
		const { id, userId } = data;

		const { poll, options } = await fetchPollByIdWithOptions(id);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(id, userId)
			: false;

		return { poll, options, hasAnswered };
	});
};

export const getPollByIdHandler = async ({
	data,
}: {
	data: { id: number };
}) => {
	return handleApiOperation(async () => {
		return await getPollOrError(data.id);
	});
};

export const getAllPollsHandler = async () => {
	return handleApiOperation(async () => {
		return await fetchAllPolls();
	});
};

export const getDailyPollHandler = async ({
	data,
}: {
	data: { userId?: string; date?: string };
}) => {
	return handleApiOperation(async () => {
		const { userId, date } = data;

		const { poll, options } = await getDailyPollWithOptions(date);
		const hasAnswered = userId
			? await hasUserAnsweredPoll(poll.id, userId)
			: false;

		return { poll, options, hasAnswered };
	});
};

export const postPollOptionsHandler = async ({
	data,
}: {
	data: PollSubmissionInput;
}) => {
	return handleApiOperation(async () => {
		const validatedData = await validatePollSubmission(data);
		const { allCorrectOptions, selectedOptionRecords } = await fetchPollOptions(
			validatedData.pollId,
			validatedData.selectedOptions
		);
		const answerMetrics = calculateAnswerMetrics(
			allCorrectOptions,
			selectedOptionRecords
		);

		const { xpEarned, runEnded, thresholdInfo } = await processPollAnswer({
			pollId: validatedData.pollId,
			userId: validatedData.userId,
			selectedOptionIds: validatedData.selectedOptionIds,
			categoryCode: validatedData.poll.categoryCode,
			...answerMetrics,
		});

		return {
			message: "Options submitted successfully",
			isCorrect: answerMetrics.isCorrect,
			runEnded,
			xpEarned,
			thresholdInfo,
		};
	});
};

async function getPollOrError(id: number) {
	const poll = await fetchPollById(id);
	if (!poll) throw new Error("Poll not found");
	return poll;
}

type ValidatedPollSubmission = {
	pollId: number;
	selectedOptions: string[];
	userId: string;
	selectedOptionIds: number[];
	poll: NonNullable<Awaited<ReturnType<typeof fetchPollById>>>;
};

type PollOptions = {
	allCorrectOptions: Array<{ id: number; correct: boolean }>;
	selectedOptionRecords: Array<{ id: number; correct: boolean }>;
};

type AnswerMetrics = {
	nCorrect: number;
	nWrong: number;
	nTotal: number;
	isCorrect: boolean;
};

async function validatePollSubmission(
	data: PollSubmissionInput
): Promise<ValidatedPollSubmission> {
	const validatedData = pollSubmissionSchema.parse(data);
	const { pollId, selectedOptions, userId } = validatedData;

	const hasAnswered = await hasUserAnsweredPoll(pollId, userId);
	if (hasAnswered) {
		throw new Error("You have already answered this poll");
	}

	const poll = await fetchPollById(pollId);
	if (!poll) {
		throw new Error("Poll not found");
	}

	const selectedOptionIds = selectedOptions.map((option) => Number(option));

	return {
		pollId,
		selectedOptions,
		userId,
		selectedOptionIds,
		poll,
	};
}

async function fetchPollOptions(
	pollId: number,
	selectedOptions: string[]
): Promise<PollOptions> {
	const selectedOptionIds = selectedOptions.map((option) => Number(option));

	const allCorrectOptions = await db
		.select()
		.from(pollOptionsTable)
		.where(
			and(
				eq(pollOptionsTable.poll_id, pollId),
				eq(pollOptionsTable.correct, true)
			)
		);

	const selectedOptionRecords = await db
		.select()
		.from(pollOptionsTable)
		.where(
			and(
				eq(pollOptionsTable.poll_id, pollId),
				inArray(pollOptionsTable.id, selectedOptionIds)
			)
		);

	return { allCorrectOptions, selectedOptionRecords };
}

function calculateAnswerMetrics(
	allCorrectOptions: Array<{ correct: boolean }>,
	selectedOptionRecords: Array<{ correct: boolean }>
): AnswerMetrics {
	const nCorrect = selectedOptionRecords.filter(
		(option) => option.correct
	).length;
	const nWrong = selectedOptionRecords.filter(
		(option) => !option.correct
	).length;
	const nTotal = allCorrectOptions.length;

	const isCorrect =
		selectedOptionRecords.length > 0 &&
		selectedOptionRecords.every((option) => option.correct);

	return { nCorrect, nWrong, nTotal, isCorrect };
}
