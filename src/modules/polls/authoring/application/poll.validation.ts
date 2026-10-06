import { z } from "zod";

import {
	ANSWER_TYPES,
	type AnswerType,
	GRID_GROUP_SIZE,
	GRID_GROUPS,
	GRID_TILES,
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
		.max(GRID_GROUPS - 1)
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
	groupLabels: z
		.array(z.string().max(POLL_LIMITS.answer.max))
		.nullable()
		.optional(),
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

type GridShape = {
	poll: { answerType?: AnswerType; groupLabels?: string[] | null };
	options: { group?: number | null }[];
};

const tilesInGroup = (options: GridShape["options"], group: number): number =>
	options.filter((option) => option.group === group).length;

const hasNamedGroups = (labels: string[] | null | undefined): boolean =>
	labels?.length === GRID_GROUPS &&
	labels.every((label) => label.trim() !== "");

const isWellFormedGrid = {
	check: ({ poll, options }: GridShape) =>
		poll.answerType !== "grid" ||
		(hasNamedGroups(poll.groupLabels) &&
			options.length === GRID_TILES &&
			Array.from({ length: GRID_GROUPS }, (_, group) => group).every(
				(group) => tilesInGroup(options, group) === GRID_GROUP_SIZE
			)),
	message: "A grid needs three named groups of four tiles",
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
	.refine(isWellFormedGrid.check, {
		message: isWellFormedGrid.message,
		path: [...isWellFormedGrid.path],
	});

export const updatePollSchema = z
	.object({
		id: z.number().int().positive(),
		poll: basePollDataSchema.partial(),
		options: optionsOf(updatePollOptionSchema),
	})
	.refine(hasACorrectOption.check, {
		message: hasACorrectOption.message,
		path: [...hasACorrectOption.path],
	})
	.refine(isWellFormedGrid.check, {
		message: isWellFormedGrid.message,
		path: [...isWellFormedGrid.path],
	});

export type CreatePollWithOptionsInput = z.infer<
	typeof createPollWithOptionsSchema
>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
