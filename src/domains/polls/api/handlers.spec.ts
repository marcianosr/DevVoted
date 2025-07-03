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
	createPollResponse: vi.fn(),
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
				categoryCode: "frontend",
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

		it("returns all poll data with options", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(queries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
				},
			});

			expect(queries.fetchPollByIdWithOptions).toHaveBeenCalledWith(2);
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
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
			const mockPoll = createMockPoll({ id: 2 });
			vi.mocked(queries.fetchPollById).mockResolvedValue(mockPoll);

			const mockOptions = createMockPollOptionArray(4);
			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) => option.option),
				},
			});

			expect(result?.success).toBe(true);
			expect(result?.message).toBe("Options submitted successfully");
		});

		it("fails to post the selected options data to the backend when no options are selected", async () => {
			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: [],
				},
			});

			expect(result?.success).toBe(false);
			expect(result?.error).toBe("Please select at least one option");
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
			expect(result.error).toBe("Poll not found");
		});
	});
});
