import { z } from "zod";

import {
	ANSWER_TYPES,
	type AnswerType,
	PAIR_SIZE,
	PAIR_TILES,
	PAIRS,
} from "~/shared/lib/answerTypes";
import {
	POLL_LIMITS,
	POLL_STATUSES,
} from "~/modules/polls/poll/domain/poll.model";

export const CODE_SANDBOX_URL = z.string().url();

const newPollOptionSchema = z.object({
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(
			POLL_LIMITS.answer.max,
			`Option cannot exceed ${POLL_LIMITS.answer.max} characters`
		),
	correct: z.boolean().default(false),
	group: z
		.number()
		.int()
		.min(0)
		.max(PAIRS - 1)
		.nullable()
		.optional(),
	explanation: z
		.string()
		.max(
			POLL_LIMITS.answerExplanation.max,
			`Option explanation cannot exceed ${POLL_LIMITS.answerExplanation.max} characters`
		)
		.nullable()
		.optional(),
});

const updatePollOptionSchema = newPollOptionSchema.extend({
	id: z.number().int().positive().optional(),
});

const basePollDataSchema = z.object({
	question: z
		.string()
		.min(
			POLL_LIMITS.question.min,
			`Question must be at least ${POLL_LIMITS.question.min} characters`
		)
		.max(
			POLL_LIMITS.question.max,
			`Question cannot exceed ${POLL_LIMITS.question.max} characters`
		),
	status: z.enum(POLL_STATUSES),
	answerType: z.enum(ANSWER_TYPES),
	categoryCode: z.string().min(1, "Category is required"),
	codeBlock: z.string().nullable().optional(),
	codeSandboxExample: CODE_SANDBOX_URL.nullable().optional(),
	explanation: z
		.string()
		.max(
			POLL_LIMITS.explanation.max,
			`Explanation cannot exceed ${POLL_LIMITS.explanation.max} characters`
		)
		.nullable()
		.optional(),
});

const optionsOf = <Option extends z.ZodTypeAny>(option: Option) =>
	z
		.array(option)
		.min(
			POLL_LIMITS.answers.min,
			`At least ${POLL_LIMITS.answers.min} options required`
		)
		.max(
			POLL_LIMITS.answers.max,
			`Cannot exceed ${POLL_LIMITS.answers.max} options`
		);

const hasACorrectOption = {
	check: (data: { options: { correct: boolean }[] }) =>
		data.options.some((option) => option.correct),
	message: "At least one option must be marked as correct",
	path: ["options"] as const,
};

type PairsShape = {
	poll: { answerType?: AnswerType };
	options: { group?: number | null }[];
};

const tilesInPair = (options: PairsShape["options"], pair: number): number =>
	options.filter((option) => option.group === pair).length;

const isWellFormedPairs = {
	check: ({ poll, options }: PairsShape) =>
		poll.answerType !== "pairs" ||
		(options.length === PAIR_TILES &&
			Array.from({ length: PAIRS }, (_, pair) => pair).every(
				(pair) => tilesInPair(options, pair) === PAIR_SIZE
			)),
	message: "A pairs poll needs four pairs of two tiles",
	path: ["options"] as const,
};

export const createPollWithOptionsSchema = z
	.object({
		poll: basePollDataSchema,
		options: optionsOf(newPollOptionSchema),
	})
	.refine(hasACorrectOption.check, {
		message: hasACorrectOption.message,
		path: [...hasACorrectOption.path],
	})
	.refine(isWellFormedPairs.check, {
		message: isWellFormedPairs.message,
		path: [...isWellFormedPairs.path],
	});

export const updatePollSchema = z
	.object({
		id: z.number().int().positive(),
		poll: basePollDataSchema.partial(),
		options: optionsOf(updatePollOptionSchema),
		reviewed: z.boolean().optional(),
	})
	.refine(hasACorrectOption.check, {
		message: hasACorrectOption.message,
		path: [...hasACorrectOption.path],
	})
	.refine(isWellFormedPairs.check, {
		message: isWellFormedPairs.message,
		path: [...isWellFormedPairs.path],
	});

export type CreatePollWithOptionsInput = z.infer<
	typeof createPollWithOptionsSchema
>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
