import { z } from "zod";

import {
	ANSWER_TYPES,
	type AnswerType,
	MAX_PAIRS,
	MIN_PAIRS,
	PAIR_SIZE,
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
		.max(MAX_PAIRS - 1)
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
	options: { option: string; group?: number | null }[];
};

const tilesInPair = (options: PairsShape["options"], pair: number): number =>
	options.filter((option) => option.group === pair).length;

const pairCountOf = (options: PairsShape["options"]): number =>
	options.length / PAIR_SIZE;

const holdsAPairCount = (options: PairsShape["options"]): boolean =>
	Number.isInteger(pairCountOf(options)) &&
	pairCountOf(options) >= MIN_PAIRS &&
	pairCountOf(options) <= MAX_PAIRS;

const isWellFormedPairs = {
	check: ({ poll, options }: PairsShape) =>
		poll.answerType !== "pairs" ||
		(holdsAPairCount(options) &&
			Array.from({ length: pairCountOf(options) }, (_, pair) => pair).every(
				(pair) => tilesInPair(options, pair) === PAIR_SIZE
			)),
	message: "A pairs poll needs four to six pairs of two tiles",
	path: ["options"] as const,
};

const fitsEveryTile = {
	check: ({ poll, options }: PairsShape) =>
		poll.answerType !== "pairs" ||
		options.every(
			(option) => option.option.trim().length <= POLL_LIMITS.tile.max
		),
	message: `A tile cannot exceed ${POLL_LIMITS.tile.max} characters`,
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
	})
	.refine(fitsEveryTile.check, {
		message: fitsEveryTile.message,
		path: [...fitsEveryTile.path],
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
	})
	.refine(fitsEveryTile.check, {
		message: fitsEveryTile.message,
		path: [...fitsEveryTile.path],
	});

export type CreatePollWithOptionsInput = z.infer<
	typeof createPollWithOptionsSchema
>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
