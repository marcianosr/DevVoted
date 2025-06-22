import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPollById } from "@/src/domains/polls/api/polls";
import * as queries from "@/src/domains/polls/api/queries";
import { createMockPoll } from "../factories/pollFactory";

vi.mock("@/src/domains/polls/api/queries", () => ({
	fetchPollById: vi.fn(),
}));

describe("getPollById", () => {
	const mockPoll = createMockPoll({
		id: 222,
		categoryCode: "frontend",
	});

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns poll data when a poll is found", async () => {
		vi.mocked(queries.fetchPollById).mockResolvedValue(mockPoll);

		const result = await getPollById({
			data: {
				id: 1,
			},
		});

		expect(queries.fetchPollById).toHaveBeenCalledWith(1);
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
			error: "Poll not found",
		});
	});

	it("handles errors during fetch", async () => {
		// Arrange
		const errorMessage = "Database connection error";
		vi.mocked(queries.fetchPollById).mockRejectedValue(
			new Error(errorMessage)
		);

		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const result = await getPollById({
			data: {
				id: 1,
			},
		});

		expect(queries.fetchPollById).toHaveBeenCalledWith(1);
		expect(consoleSpy).toHaveBeenCalledWith(
			"Error fetching poll:",
			expect.any(Error)
		);
		expect(result).toEqual({
			success: false,
			error: "Failed to fetch poll",
		});

		consoleSpy.mockRestore();
	});
});
