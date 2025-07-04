import { describe, it, expect } from "vitest";
import {
	pollSubmissionSchema,
	pollIdParamSchema,
	createPollSchema,
	pollOptionSchema,
	userResponseSchema,
} from "./schemas";

describe("Poll Validation Schemas", () => {
	describe("pollSubmissionSchema", () => {
		it("validates correct poll submission data", () => {
			const validData = {
				pollId: 1,
				selectedOptions: ["1", "2"],
				userId: "123e4567-e89b-12d3-a456-426614174000",
			};

			const result = pollSubmissionSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it("rejects invalid poll ID", () => {
			const invalidData = {
				pollId: -1,
				selectedOptions: ["1"],
				userId: "123e4567-e89b-12d3-a456-426614174000",
			};

			expect(() => pollSubmissionSchema.parse(invalidData)).toThrow(
				"Poll ID must be a positive integer"
			);
		});

		it("rejects empty selected options", () => {
			const invalidData = {
				pollId: 1,
				selectedOptions: [],
				userId: "123e4567-e89b-12d3-a456-426614174000",
			};

			expect(() => pollSubmissionSchema.parse(invalidData)).toThrow(
				"At least one option must be selected"
			);
		});

		it("rejects too many selected options", () => {
			const invalidData = {
				pollId: 1,
				selectedOptions: Array(11).fill("1"),
				userId: "123e4567-e89b-12d3-a456-426614174000",
			};

			expect(() => pollSubmissionSchema.parse(invalidData)).toThrow(
				"Cannot select more than 10 options"
			);
		});

		it("rejects invalid UUID", () => {
			const invalidData = {
				pollId: 1,
				selectedOptions: ["1"],
				userId: "invalid-uuid",
			};

			expect(() => pollSubmissionSchema.parse(invalidData)).toThrow(
				"User ID must be a valid UUID"
			);
		});
	});

	describe("createPollSchema", () => {
		it("validates correct poll creation data", () => {
			const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const laterDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

			const validData = {
				question: "What is your favorite programming language?",
				status: "draft" as const,
				answerType: "single" as const,
				openingTime: futureDate,
				closingTime: laterDate,
				categoryCode: "tech",
				createdBy: "123e4567-e89b-12d3-a456-426614174000",
			};

			const result = createPollSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it("rejects question that is too short", () => {
			const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const laterDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

			const invalidData = {
				question: "Short?",
				status: "draft" as const,
				answerType: "single" as const,
				openingTime: futureDate,
				closingTime: laterDate,
				categoryCode: "tech",
				createdBy: "123e4567-e89b-12d3-a456-426614174000",
			};

			expect(() => createPollSchema.parse(invalidData)).toThrow(
				"Question must be at least 10 characters"
			);
		});

		it("rejects closing time before opening time", () => {
			const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
			const earlierDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

			const invalidData = {
				question: "What is your favorite programming language?",
				status: "draft" as const,
				answerType: "single" as const,
				openingTime: futureDate,
				closingTime: earlierDate,
				categoryCode: "tech",
				createdBy: "123e4567-e89b-12d3-a456-426614174000",
			};

			expect(() => createPollSchema.parse(invalidData)).toThrow(
				"Closing time must be after opening time"
			);
		});
	});

	describe("userResponseSchema", () => {
		it("validates correct user response data", () => {
			const validData = {
				pollId: 1,
				userId: "123e4567-e89b-12d3-a456-426614174000",
				selectedOptionIds: [1, 2, 3],
			};

			const result = userResponseSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it("rejects empty selected option IDs", () => {
			const invalidData = {
				pollId: 1,
				userId: "123e4567-e89b-12d3-a456-426614174000",
				selectedOptionIds: [],
			};

			expect(() => userResponseSchema.parse(invalidData)).toThrow(
				"At least one option must be selected"
			);
		});
	});
});