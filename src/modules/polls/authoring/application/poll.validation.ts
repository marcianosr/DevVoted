import { z } from "zod";

import { POLL_STATUSES } from "~/modules/polls/poll/domain/poll.model";

// New poll option (without pollId — for create/edit forms)
const newPollOptionSchema = z.object({
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(500, "Option cannot exceed 500 characters"),
	correct: z.boolean().default(false),
});

// Poll option for updates: existing options carry an id so they are updated
// rather than replaced.
const updatePollOptionSchema = newPollOptionSchema.extend({
	id: z.number().int().positive().optional(),
});

const basePollDataSchema = z.object({
	question: z
		.string()
		.min(10, "Question must be at least 10 characters")
		.max(2000, "Question cannot exceed 2000 characters"),
	status: z.enum(POLL_STATUSES),
	answerType: z.enum(["single", "multiple"]),
	categoryCode: z.string().min(1, "Category is required"),
	codeBlock: z.string().nullable().optional(),
	codeSandboxExample: z.string().url().nullable().optional(),
	explanation: z
		.string()
		.max(2000, "Explanation cannot exceed 2000 characters")
		.nullable()
		.optional(),
});

const hasACorrectOption = {
	check: (data: { options: { correct: boolean }[] }) =>
		data.options.some((option) => option.correct),
	message: "At least one option must be marked as correct",
	path: ["options"] as const,
};

export const createPollWithOptionsSchema = z
	.object({
		poll: basePollDataSchema,
		options: z
			.array(newPollOptionSchema)
			.min(3, "At least 3 options required")
			.max(20, "Cannot exceed 20 options"),
	})
	.refine(hasACorrectOption.check, {
		message: hasACorrectOption.message,
		path: [...hasACorrectOption.path],
	});

export const updatePollSchema = z
	.object({
		id: z.number().int().positive(),
		poll: basePollDataSchema.partial(),
		options: z
			.array(updatePollOptionSchema)
			.min(3, "At least 3 options required")
			.max(20, "Cannot exceed 20 options"),
	})
	.refine(hasACorrectOption.check, {
		message: hasACorrectOption.message,
		path: [...hasACorrectOption.path],
	});

export type CreatePollWithOptionsInput = z.infer<
	typeof createPollWithOptionsSchema
>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
