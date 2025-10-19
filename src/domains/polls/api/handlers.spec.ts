import { describe, it, expect, vi, beforeEach } from "vitest";
import * as queries from "~/domains/polls/api/queries";
import { createMockPoll, createMockPollArray } from "../factories/poll";
import { createMockPollOptionArray } from "../factories/pollOption";
import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
	postPollOptionsHandler,
} from "./handlers";

vi.mock("@/src/domains/polls/api/queries", () => ({
	fetchPollById: vi.fn(),
	fetchAllPolls: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
	hasUserAnsweredPoll: vi.fn(),
}));

vi.mock("~/domains/polls/services/processPollAnswer.service", () => ({
	processPollAnswer: vi.fn(),
}));

// Tests service layer logic that wraps query methods and structures return data
describe("handlers", () => {
	describe("getPollById", () => {
		beforeEach(() => {
			vi.resetAllMocks();
		});

		it("returns poll data when a poll is found", async () => {
			const pollId = 198;
			const mockPoll = createMockPoll({
				id: pollId,
				categoryCode: "general-frontend",
			});

			vi.mocked(queries.fetchPollById).mockResolvedValue(mockPoll);

			const result = await getPollByIdHandler({
				data: {
					id: pollId,
				},
			});

			expect(queries.fetchPollById).toHaveBeenCalledWith(pollId);
			expect(result).toEqual({
				success: true,
				data: mockPoll,
			});
		});

		it("returns an error when poll is not found", async () => {
			//ts-expect error
			vi.mocked(queries.fetchPollById).mockResolvedValue(null);

			const result = await getPollByIdHandler({
				data: {
					id: 999,
				},
			});

			expect(queries.fetchPollById).toHaveBeenCalledWith(999);
			expect(result).toEqual({
				success: false,
				error: "Poll not found",
			});
		});
	});

	describe("getAllPolls", () => {
		beforeEach(() => {
			vi.resetAllMocks();
		});

		it("returns all poll data", async () => {
			const mockPolls = createMockPollArray(10);

			vi.mocked(queries.fetchAllPolls).mockResolvedValue(mockPolls);

			const result = await getAllPollsHandler();

			expect(queries.fetchAllPolls).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: mockPolls,
			});
		});

		it("returns an error when no polls are found", async () => {
			vi.mocked(queries.fetchAllPolls).mockResolvedValue([]);

			const result = await getAllPollsHandler();

			expect(queries.fetchAllPolls).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: [],
			});
		});
	});

	describe("getPollByIdWithOptions", () => {
		beforeEach(() => {
			vi.resetAllMocks();
		});

		it("returns all poll data with options and hasAnswered status", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(queries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(false);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(queries.fetchPollByIdWithOptions).toHaveBeenCalledWith(2);
			expect(queries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				2,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: false,
					timesAnswered: 0,
				},
			});
		});

		it("returns hasAnswered true when user has already answered", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(queries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(true);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(queries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				2,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: true,
					timesAnswered: 0,
				},
			});
		});

		it("returns hasAnswered false when no userId provided", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(queries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(false);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
				},
			});

			// hasUserAnsweredPoll should NOT be called when userId is undefined
			expect(queries.hasUserAnsweredPoll).not.toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: false,
					timesAnswered: 0,
				},
			});
		});

		it("returns an error when poll with options is not found", async () => {
			//@ts-ignore
			vi.mocked(queries.fetchPollByIdWithOptions).mockRejectedValue(
				new Error("Poll not found")
			);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 123,
				},
			});

			expect(queries.fetchPollByIdWithOptions).toHaveBeenCalledWith(123);
			expect(result).toEqual({
				success: false,
				error: "Poll not found",
			});
		});
	});

	describe("postPollOptions", () => {
		beforeEach(() => {
			vi.resetAllMocks();
		});

		it("posts the selected options to the backend", async () => {
			const mockPoll = createMockPoll({ id: 123, categoryCode: "js" });
			vi.mocked(queries.fetchPollById).mockResolvedValue(mockPoll);
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(false);

			const mockOptions = createMockPollOptionArray(4);
			mockOptions[0].correct = true;

			// Mock processPollAnswer service
			const { processPollAnswer } = await import(
				"~/domains/polls/services/processPollAnswer.service"
			);
			vi.mocked(processPollAnswer).mockResolvedValue({
				selectedOptionIds: [1, 2, 3, 4],
				correctOptionIds: [1],
				outcome: "full",
				runEnded: false,
				thresholdInfo: null,
				breakdown: null,
			});

			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) =>
						option.id.toString()
					),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(queries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result?.success).toBe(true);
			if (result?.success) {
				expect(result.data.message).toBe(
					"Options submitted successfully"
				);
			}
		});

		it("fails to post the selected options data to the backend when no options are selected", async () => {
			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: [],
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(result?.success).toBe(false);
			if (!result?.success) {
				expect(result.error).toContain(
					"At least one option must be selected"
				);
			}
		});

		it("fails to post the selected options data to the backend when poll id is invalid", async () => {
			const mockOptions = createMockPollOptionArray(4);
			const result = await postPollOptionsHandler({
				data: {
					//@ts-expect-error
					pollId: null,
					selectedOptions: mockOptions.map((option) => option.option),
				},
			});

			expect(result.success).toBe(false);
			// Now validation catches invalid input first, so we get validation errors
			if (!result.success) {
				expect(result.error).toContain(
					"Expected number, received null"
				);
			}
		});

		it("fails to post when user has already answered the poll", async () => {
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(true);

			const mockOptions = createMockPollOptionArray(4);
			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) =>
						option.id.toString()
					),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(queries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(
					"You have already answered this poll"
				);
			}
		});

		it("allows post when user has not answered the poll yet", async () => {
			const mockPoll = createMockPoll({ id: 123, categoryCode: "js" });
			vi.mocked(queries.fetchPollById).mockResolvedValue(mockPoll);
			vi.mocked(queries.hasUserAnsweredPoll).mockResolvedValue(false);

			const mockOptions = createMockPollOptionArray(2);
			mockOptions[0].correct = true;

			// Mock processPollAnswer service
			const { processPollAnswer } = await import(
				"~/domains/polls/services/processPollAnswer.service"
			);
			vi.mocked(processPollAnswer).mockResolvedValue({
				selectedOptionIds: [1, 2],
				correctOptionIds: [1],
				outcome: "full",
				runEnded: false,
				thresholdInfo: null,
				breakdown: null,
			});

			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) =>
						option.id.toString()
					),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(queries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(queries.fetchPollById).toHaveBeenCalledWith(123);
			expect(result.success).toBe(true);
		});
	});
});
