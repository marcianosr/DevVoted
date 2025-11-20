import { z } from "zod";

// Poll submission validation
export const pollSubmissionSchema = z.object({
	pollId: z.number().int().positive("Poll ID must be a positive integer"),
	selectedOptions: z
		.array(z.string().min(1, "Option ID cannot be empty"))
		.min(1, "At least one option must be selected")
		.max(10, "Cannot select more than 10 options"),
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
		status: z.enum(["draft", "needs-revision", "open", "closed", "archived"]),
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

// Poll option validation
export const pollOptionSchema = z.object({
	pollId: z.number().int().positive(),
	option: z
		.string()
		.min(1, "Option cannot be empty")
		.max(200, "Option cannot exceed 200 characters"),
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
