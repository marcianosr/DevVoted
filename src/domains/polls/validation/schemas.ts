import { z } from "zod";

// Poll submission validation
export const pollSubmissionSchema = z.object({
	pollId: z.number().int().positive("Poll ID must be a positive integer"),
	selectedOptions: z
		.array(z.string().min(1, "Option ID cannot be empty"))
		.min(1, "At least one option must be selected"),
	userId: z.string().uuid("User ID must be a valid UUID"),
});

// Poll ID parameter validation
export const pollIdParamSchema = z.object({
	id: z.number().int().positive("Poll ID must be a positive integer"),
	userId: z.string().uuid("User ID must be a valid UUID").optional(),
});

// Poll creation validation
export const createPollSchema = z
	.object({
		question: z
			.string()
			.min(10, "Question must be at least 10 characters")
			.max(500, "Question cannot exceed 500 characters"),
		status: z.enum(["draft", "open", "closed", "archived"]),
		answerType: z.enum(["single", "multiple"]),
		openingTime: z.date().min(new Date(), "Opening time must be in the future"),
		closingTime: z.date(),
		categoryCode: z.string().min(1, "Category is required"),
		createdBy: z.string().uuid("Creator ID must be a valid UUID"),
	})
	.refine((data) => data.closingTime > data.openingTime, {
		message: "Closing time must be after opening time",
		path: ["closingTime"],
	});

// Poll option validation (for existing options with ID)
export const pollOptionSchema = z.object({
	pollId: z.number().int().positive(),
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(200, "Option cannot exceed 200 characters"),
	correct: z.boolean().default(false),
});

// New poll option (without pollId - for create/edit forms)
export const newPollOptionSchema = z.object({
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(500, "Option cannot exceed 500 characters"),
	correct: z.boolean().default(false),
});

// Poll option for updates (with optional ID to preserve existing options)
export const updatePollOptionSchema = z.object({
	id: z.number().int().positive().optional(), // Existing options have ID, new ones don't
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(500, "Option cannot exceed 500 characters"),
	correct: z.boolean().default(false),
});

// User response validation
export const userResponseSchema = z.object({
	pollId: z.number().int().positive(),
	userId: z.string().uuid(),
	selectedOptionIds: z
		.array(z.number().int().positive())
		.min(1, "At least one option must be selected"),
});

export type PollSubmissionInput = z.infer<typeof pollSubmissionSchema>;
export type PollIdParamInput = z.infer<typeof pollIdParamSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type PollOptionInput = z.infer<typeof pollOptionSchema>;
export type UserResponseInput = z.infer<typeof userResponseSchema>;
export type NewPollOptionInput = z.infer<typeof newPollOptionSchema>;
export type UpdatePollOptionInput = z.infer<typeof updatePollOptionSchema>;

// ============================================
// Poll CRUD Schemas
// ============================================

// Base poll data schema (without refinements for reuse)
const basePollDataSchema = z.object({
	question: z
		.string()
		.min(10, "Question must be at least 10 characters")
		.max(2000, "Question cannot exceed 2000 characters"),
	status: z.enum(["draft", "open", "closed", "archived"]),
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

// Create poll with options schema
export const createPollWithOptionsSchema = z
	.object({
		poll: basePollDataSchema,
		options: z
			.array(newPollOptionSchema)
			.min(3, "At least 3 options required")
			.max(20, "Cannot exceed 20 options"),
	})
	.refine((data) => data.options.some((opt) => opt.correct), {
		message: "At least one option must be marked as correct",
		path: ["options"],
	});

// Update poll schema
export const updatePollSchema = z
	.object({
		id: z.number().int().positive(),
		poll: basePollDataSchema.partial(),
		options: z
			.array(updatePollOptionSchema)
			.min(3, "At least 3 options required")
			.max(20, "Cannot exceed 20 options"),
	})
	.refine((data) => data.options.some((opt) => opt.correct), {
		message: "At least one option must be marked as correct",
		path: ["options"],
	});

export type CreatePollWithOptionsInput = z.infer<
	typeof createPollWithOptionsSchema
>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
