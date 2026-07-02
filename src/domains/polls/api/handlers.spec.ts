import { describe, it, expect, vi, beforeEach } from "vitest";

import * as pollQueries from "~/domains/polls/api/poll.queries";
import * as pollResponseQueries from "~/domains/polls/api/pollResponse.queries";

import {
	getAllPollsHandler,
	getPollByIdHandler,
	getPollByIdWithOptionsHandler,
} from "./poll.handlers";
import {
	postPollOptionsHandler,
	getDailyPollHandler,
} from "./dailyPoll.handlers";
import { createMockPoll, createMockPollArray } from "../models/poll.mock";
import { createMockPollOptionArray } from "../models/pollOption.mock";

vi.mock("~/domains/polls/api/poll.queries", () => ({
	fetchPollById: vi.fn(),
	fetchAllPolls: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
	createPollWithOptions: vi.fn(),
	updatePollWithOptions: vi.fn(),
}));

vi.mock("~/domains/polls/api/pollResponse.queries", () => ({
	hasUserAnsweredPoll: vi.fn(),
	getUserSelectedOptions: vi.fn(),
	getPollHistory: vi.fn(),
	getLastSeenBeforeCurrentRun: vi.fn(),
	getTimesEncountered: vi.fn(),
	trackPollView: vi.fn(),
	trackPollAnswer: vi.fn(),
	getPollsSeenInRun: vi.fn(),
	getRunPollHistory: vi.fn(),
	getPollResponseScoreBreakdown: vi.fn(),
}));

vi.mock("~/domains/polls/api/dailyPoll.queries", () => ({
	getLastGlobalDailyPollDate: vi.fn(),
}));

vi.mock("~/domains/runs/services/turn.service", () => ({
	processTurn: vi.fn(),
}));

vi.mock("~/domains/polls/services/dailyPoll.service", () => ({
	getDailyPollWithOptions: vi.fn(),
}));

vi.mock("date-fns", () => ({
	isSameDay: vi.fn(),
}));

vi.mock("~/domains/runs/api/handlers", () => ({
	getUserActiveRun: vi.fn(),
}));

vi.mock("~/domains/users/api/queries", () => ({
	fetchUserDisplayName: vi.fn(),
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

			vi.mocked(pollQueries.fetchPollById).mockResolvedValue(mockPoll);

			const result = await getPollByIdHandler({
				data: {
					id: pollId,
				},
			});

			expect(pollQueries.fetchPollById).toHaveBeenCalledWith(pollId);
			expect(result).toEqual({
				success: true,
				data: mockPoll,
			});
		});

		it("returns an error when poll is not found", async () => {
			//ts-expect error
			vi.mocked(pollQueries.fetchPollById).mockResolvedValue(null);

			const result = await getPollByIdHandler({
				data: {
					id: 999,
				},
			});

			expect(pollQueries.fetchPollById).toHaveBeenCalledWith(999);
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

			vi.mocked(pollQueries.fetchAllPolls).mockResolvedValue(mockPolls);

			const result = await getAllPollsHandler();

			expect(pollQueries.fetchAllPolls).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: mockPolls,
			});
		});

		it("returns an error when no polls are found", async () => {
			vi.mocked(pollQueries.fetchAllPolls).mockResolvedValue([]);

			const result = await getAllPollsHandler();

			expect(pollQueries.fetchAllPolls).toHaveBeenCalled();
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

			vi.mocked(pollQueries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(pollQueries.fetchPollByIdWithOptions).toHaveBeenCalledWith(2);
			expect(pollResponseQueries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				2,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: false,
				},
			});
		});

		it("returns hasAnswered true when user has already answered", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(pollQueries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				true
			);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(pollResponseQueries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				2,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: true,
				},
			});
		});

		it("returns hasAnswered false when no userId provided", async () => {
			const mockPoll = createMockPoll({ id: 2 });
			const mockOptions = createMockPollOptionArray(4);

			vi.mocked(pollQueries.fetchPollByIdWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 2,
				},
			});

			// hasUserAnsweredPoll should NOT be called when userId is undefined
			expect(pollResponseQueries.hasUserAnsweredPoll).not.toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
				data: {
					poll: mockPoll,
					options: mockOptions,
					hasAnswered: false,
				},
			});
		});

		it("returns an error when poll with options is not found", async () => {
			vi.mocked(pollQueries.fetchPollByIdWithOptions).mockRejectedValue(
				new Error("Poll not found")
			);

			const result = await getPollByIdWithOptionsHandler({
				data: {
					id: 123,
				},
			});

			expect(pollQueries.fetchPollByIdWithOptions).toHaveBeenCalledWith(123);
			expect(result).toEqual({
				success: false,
				error: "Poll not found",
			});
		});
	});

	describe("postPollOptions", () => {
		beforeEach(async () => {
			vi.resetAllMocks();
			// Mock getPollsSeenInRun (used by processPollAnswer internally)
			vi.mocked(pollResponseQueries.getPollsSeenInRun).mockResolvedValue(10);
			// Mock active run
			const { getUserActiveRun } = await import("~/domains/runs/api/handlers");
			vi.mocked(getUserActiveRun).mockResolvedValue({
				success: true,
				data: { id: 1 } as any,
			});
		});

		it("posts the selected options to the backend", async () => {
			const mockPoll = createMockPoll({ id: 123, categoryCode: "js" });
			vi.mocked(pollQueries.fetchPollById).mockResolvedValue(mockPoll);
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const mockOptions = createMockPollOptionArray(4);
			mockOptions[0].correct = true;

			// Mock turn service
			const { processTurn } =
				await import("~/domains/runs/services/turn.service");
			vi.mocked(processTurn).mockResolvedValue({
				runId: 1,
				selectedOptionIds: [1, 2, 3, 4],
				correctOptionIds: [1],
				outcome: "full",
				runEnded: false,
				breakdown: null,
				newTotalCoverage: null,
				tryCatchUsed: false,
				pipelineEvaluation: null,
				evaluationContext: null,
				upgradeCards: [],
			});

			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) => option.id.toString()),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(pollResponseQueries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result?.success).toBe(true);
			if (result?.success) {
				expect(result.data.message).toBe("Options submitted successfully");
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
				expect(result.error).toContain("At least one option must be selected");
			}
		});

		it("fails to post the selected options data to the backend when poll id is invalid", async () => {
			const mockOptions = createMockPollOptionArray(4);
			const result = await postPollOptionsHandler({
				data: {
					//@ts-expect-error - testing invalid input
					pollId: null,
					selectedOptions: mockOptions.map((option) => option.option),
				},
			});

			expect(result.success).toBe(false);
			// Now validation catches invalid input first, so we get validation errors
			if (!result.success) {
				expect(result.error).toContain("Expected number, received null");
			}
		});

		it("fails to post when user has already answered the poll", async () => {
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				true
			);

			const mockOptions = createMockPollOptionArray(4);
			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) => option.id.toString()),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(pollResponseQueries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("You have already answered this poll");
			}
		});

		it("allows post when user has not answered the poll yet", async () => {
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const mockOptions = createMockPollOptionArray(2);
			mockOptions[0].correct = true;

			// Mock turn service
			const { processTurn } =
				await import("~/domains/runs/services/turn.service");
			vi.mocked(processTurn).mockResolvedValue({
				runId: 1,
				selectedOptionIds: [1, 2],
				correctOptionIds: [1],
				outcome: "full",
				runEnded: false,
				breakdown: null,
				newTotalCoverage: null,
				tryCatchUsed: false,
				pipelineEvaluation: null,
				evaluationContext: null,
				upgradeCards: [],
			});

			const result = await postPollOptionsHandler({
				data: {
					pollId: 123,
					selectedOptions: mockOptions.map((option) => option.id.toString()),
					userId: "123e4567-e89b-12d3-a456-426614174000",
				},
			});

			expect(pollResponseQueries.hasUserAnsweredPoll).toHaveBeenCalledWith(
				123,
				"123e4567-e89b-12d3-a456-426614174000"
			);
			expect(result.success).toBe(true);
		});
	});

	describe("getDailyPoll - poll view tracking deduplication", () => {
		beforeEach(async () => {
			vi.clearAllMocks();
			// Mock active run for all tests
			const { getUserActiveRun } = await import("~/domains/runs/api/handlers");
			vi.mocked(getUserActiveRun).mockResolvedValue({
				success: true,
				data: { id: 1 } as any,
			});
		});

		it("tracks poll view on first view (no history)", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "kazooi-user-13-05-1991";

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			// @ts-expect-error - Mocking null return value
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValue(null);

			const { isSameDay } = await import("date-fns");
			vi.mocked(isSameDay).mockReturnValue(false);

			const result = await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.getPollHistory).toHaveBeenCalledWith(1, 64);
			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				64
			);
			expect(result.success).toBe(true);
		});

		it("tracks poll view on different day when last_seen_at is old", async () => {
			const mockPoll = createMockPoll({ id: 100 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "mumbos-mountain-user";
			const oldDate = new Date("2024-05-01T10:00:00Z");

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValue({
				id: 1,
				run_id: 1,
				user_id: userId,
				poll_id: 100,
				times_seen: 1,
				first_seen_at: oldDate,
				last_seen_at: oldDate,
				times_answered: 0,
				last_answered_at: null,
			});

			const { isSameDay } = await import("date-fns");
			vi.mocked(isSameDay).mockReturnValue(false);

			const result = await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.getPollHistory).toHaveBeenCalledWith(1, 100);
			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				100
			);
			expect(result.success).toBe(true);
		});

		it("does not track poll view when already seen today (same day)", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "christmas-user-25-12";

			const christmasDay = new Date("2024-12-25T14:30:00Z");

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValue({
				id: 1,
				run_id: 1,
				user_id: userId,
				poll_id: 64,
				times_seen: 1,
				first_seen_at: christmasDay,
				last_seen_at: christmasDay,
				times_answered: 0,
				last_answered_at: null,
			});

			const { isSameDay } = await import("date-fns");
			vi.mocked(isSameDay).mockReturnValue(true);

			const result = await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.getPollHistory).toHaveBeenCalledWith(1, 64);
			expect(pollResponseQueries.trackPollView).not.toHaveBeenCalled();
			expect(result.success).toBe(true);
		});

		it("tracks poll view when seen on different day (day 122)", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "gruntilda-user";

			const firstDay = new Date("2024-05-13T10:00:00Z");

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValue({
				id: 1,
				run_id: 1,
				user_id: userId,
				poll_id: 64,
				times_seen: 1,
				first_seen_at: firstDay,
				last_seen_at: firstDay,
				times_answered: 0,
				last_answered_at: null,
			});

			const { isSameDay } = await import("date-fns");
			vi.mocked(isSameDay).mockReturnValue(false);

			const result = await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.getPollHistory).toHaveBeenCalledWith(1, 64);
			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				64
			);
			expect(result.success).toBe(true);
		});

		it("tracks poll view only once despite multiple refreshes on same day", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "bottles-user";

			const todayMorning = new Date("2024-12-25T08:00:00Z");

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const { isSameDay } = await import("date-fns");

			// First call - no history
			// @ts-expect-error - Mocking null return value
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValueOnce(null);
			vi.mocked(isSameDay).mockReturnValueOnce(false);

			await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.trackPollView).toHaveBeenCalledTimes(1);
			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				64
			);

			// Second call - history exists with today's date
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValueOnce({
				id: 1,
				run_id: 1,
				user_id: userId,
				poll_id: 64,
				times_seen: 1,
				first_seen_at: todayMorning,
				last_seen_at: todayMorning,
				times_answered: 0,
				last_answered_at: null,
			});
			vi.mocked(isSameDay).mockReset().mockReturnValue(true);

			await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.trackPollView).toHaveBeenCalledTimes(1);

			// Third call - still today
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValueOnce({
				id: 1,
				run_id: 1,
				user_id: userId,
				poll_id: 64,
				times_seen: 1,
				first_seen_at: todayMorning,
				last_seen_at: todayMorning,
				times_answered: 0,
				last_answered_at: null,
			});

			await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.trackPollView).toHaveBeenCalledTimes(1);
		});

		it("tracks different polls independently on same day", async () => {
			const mockPoll1 = createMockPoll({ id: 64 });
			const mockPoll2 = createMockPoll({ id: 100 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "banjo-kazooie-user";

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const { isSameDay } = await import("date-fns");

			// First poll - no history
			vi.mocked(getDailyPollWithOptions).mockResolvedValueOnce({
				poll: mockPoll1,
				options: mockOptions,
			});
			// @ts-expect-error - Mocking null return value
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValueOnce(null);
			vi.mocked(isSameDay).mockReturnValueOnce(false);

			await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				64
			);

			// Second poll (different poll_id) - no history
			vi.mocked(getDailyPollWithOptions).mockResolvedValueOnce({
				poll: mockPoll2,
				options: mockOptions,
			});
			// @ts-expect-error - Mocking null return value
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValueOnce(null);
			vi.mocked(isSameDay).mockReturnValueOnce(false);

			await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.trackPollView).toHaveBeenCalledWith(
				1,
				userId,
				100
			);
			expect(pollResponseQueries.trackPollView).toHaveBeenCalledTimes(2);
		});

		it("does not track poll view when poll was already answered in a previous run", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);
			const userId = "gruntilda-lair-user";

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				true
			);
			vi.mocked(pollResponseQueries.getUserSelectedOptions).mockResolvedValue([
				"option-1",
			]);

			// New run has no history for this poll
			// @ts-expect-error - Mocking null return value
			vi.mocked(pollResponseQueries.getPollHistory).mockResolvedValue(null);

			const { isSameDay } = await import("date-fns");
			vi.mocked(isSameDay).mockReturnValue(false);

			const result = await getDailyPollHandler({
				data: { userId },
			});

			expect(pollResponseQueries.getPollHistory).toHaveBeenCalledWith(1, 64);
			expect(pollResponseQueries.trackPollView).not.toHaveBeenCalled();
			expect(result.success).toBe(true);
		});

		it("does not track poll view when no userId provided", async () => {
			const mockPoll = createMockPoll({ id: 64 });
			const mockOptions = createMockPollOptionArray(4);

			const { getDailyPollWithOptions } =
				await import("~/domains/polls/services/dailyPoll.service");
			vi.mocked(getDailyPollWithOptions).mockResolvedValue({
				poll: mockPoll,
				options: mockOptions,
			});
			vi.mocked(pollResponseQueries.hasUserAnsweredPoll).mockResolvedValue(
				false
			);

			const result = await getDailyPollHandler({
				data: {},
			});

			expect(pollResponseQueries.getPollHistory).not.toHaveBeenCalled();
			expect(pollResponseQueries.trackPollView).not.toHaveBeenCalled();
			expect(result.success).toBe(true);
		});
	});
});
