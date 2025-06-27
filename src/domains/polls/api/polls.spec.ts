import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	getAllPolls,
	getPollById,
	getPollByIdWithOptions,
} from "@/src/domains/polls/api/polls";
import * as queries from "@/src/domains/polls/api/queries";
import { createMockPoll, createMockPollArray } from "../factories/pollFactory";
import { createMockPollOptionArray } from "../factories/pollOptionsFactory";

vi.mock("@/src/domains/polls/api/queries", () => ({
	fetchPollById: vi.fn(),
	fetchAllPolls: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
}));

// Tests service layer logic that wraps query methods and structures return data

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

		const result = await getPollById({
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
		//@ts-ignore
		vi.mocked(queries.fetchPollById).mockResolvedValue(null);

		const result = await getPollById({
			data: {
				id: 999,
			},
		});

		expect(queries.fetchPollById).toHaveBeenCalledWith(999);
		expect(result).toEqual({
			success: false,
			error: "Failed to fetch poll",
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

		const result = await getAllPolls();

		expect(queries.fetchAllPolls).toHaveBeenCalled();
		expect(result).toEqual({
			success: true,
			data: mockPolls,
		});
	});

	it("returns an error when no polls are found", async () => {
		vi.mocked(queries.fetchAllPolls).mockResolvedValue([]);

		const result = await getAllPolls();

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

		const result = await getPollByIdWithOptions({
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

		const result = await getPollByIdWithOptions({
			data: {
				id: 123,
			},
		});

		expect(queries.fetchPollByIdWithOptions).toHaveBeenCalledWith(123);
		expect(result).toEqual({
			success: false,
			error: "Failed to fetch poll",
		});
	});
});
