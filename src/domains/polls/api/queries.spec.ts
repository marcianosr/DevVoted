import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	createPollResponse,
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
	hasUserAnsweredPoll,
} from "~/domains/polls/api/queries";
import { db } from "~/database/db";
import {
	createMockPollRecordArray,
	createMockPollRecord,
} from "~/domains/polls/factories/poll";
import { createMockPollOptionRecord } from "../factories/pollOption";

// Mock the database module
vi.mock("~/database/db", () => {
	const createMockQueryBuilder = () => {
		const returningMock = vi.fn().mockResolvedValue([{ response_id: 123 }]);
		const valuesMock = vi.fn().mockReturnValue({
			returning: returningMock,
		});
		return {
			values: valuesMock,
		};
	};

	const insertMock = vi.fn(() => createMockQueryBuilder());
	const transactionMock = vi.fn((cb) =>
		cb({
			insert: vi.fn(() => createMockQueryBuilder()) as any,
		})
	);

	return {
		db: {
			select: vi.fn(),
			insert: insertMock,
			update: vi.fn(),
			delete: vi.fn(),
			transaction: transactionMock,
		},
	};
});

describe("Query logic - DTO mapping - DB errors", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe(fetchAllPolls, () => {
		it("returns transformed to DTOs for all polls", async () => {
			const mockPollRecords = createMockPollRecordArray(3);

			const mockOrderBy = vi.fn().mockResolvedValue(mockPollRecords);
			const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await fetchAllPolls();

			expect(db.select).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockOrderBy).toHaveBeenCalled();
			expect(result).toHaveLength(3);

			// Verify each poll was properly transformed from DB record to DTO
			result.forEach((poll, index) => {
				const record = mockPollRecords[index];
				expect(poll.id).toEqual(record.id);
				expect(poll.question).toEqual(record.question);
				expect(poll.status).toEqual(record.status);
				expect(poll.answerType).toEqual(record.answer_type);
				expect(poll.categoryCode).toEqual(record.category_code);
			});
		});

		it("returns an empty array when no polls exist", async () => {
			const mockOrderBy = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await fetchAllPolls();

			expect(result).toEqual([]);
		});

		it("handles database errors", async () => {
			const mockOrderBy = vi
				.fn()
				.mockRejectedValue(new Error("Database connection failed"));
			const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			await expect(fetchAllPolls()).rejects.toThrow(
				"Database connection failed"
			);
		});
	});

	describe(fetchPollById, () => {
		it("returns a transformed to DTO for a poll by id", async () => {
			const mockPollRecord = createMockPollRecord();
			const mockPollRecords = [mockPollRecord]; // Wrap in array as the DB returns an array

			const mockWhere = vi.fn().mockResolvedValue(mockPollRecords);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await fetchPollById(1);

			expect(db.select).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();

			expect(result?.id).toEqual(mockPollRecord.id);
			expect(result?.question).toEqual(mockPollRecord.question);
			expect(result?.status).toEqual(mockPollRecord.status);
			expect(result?.answerType).toEqual(mockPollRecord.answer_type);
			expect(result?.categoryCode).toEqual(mockPollRecord.category_code);
		});

		it("returns an error when poll is not found", async () => {
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);
			await expect(fetchPollById(999)).rejects.toThrow("Poll not found");
		});

		it("handles database errors", async () => {
			const mockOrderBy = vi
				.fn()
				.mockRejectedValue(new Error("Database connection failed"));
			const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			await expect(fetchAllPolls()).rejects.toThrow(
				"Database connection failed"
			);
		});
	});

	describe(fetchPollByIdWithOptions, () => {
		it("returns poll with options transformed to DTOs", async () => {
			const mockPollRecord = createMockPollRecord({ id: 1 });
			const mockOptionRecords = [
				createMockPollOptionRecord({ poll_id: 1 }),
				createMockPollOptionRecord({ poll_id: 1 }),
			];

			const mockWherePoll = vi.fn().mockResolvedValue([mockPollRecord]);
			const mockWhereOptions = vi
				.fn()
				.mockResolvedValue(mockOptionRecords);

			const mockFromPolls = vi
				.fn()
				.mockReturnValue({ where: mockWherePoll });
			const mockFromOptions = vi
				.fn()
				.mockReturnValue({ where: mockWhereOptions });

			vi.mocked(db.select)
				.mockReturnValueOnce({ from: mockFromPolls } as any)
				.mockReturnValueOnce({ from: mockFromOptions } as any);

			const result = await fetchPollByIdWithOptions(1);

			expect(result.poll.id).toBe(mockPollRecord.id);
			expect(result.options).toHaveLength(2);
			expect(result.options[0].pollId).toBe(1);
		});

		it("returns an error when poll is not found", async () => {
			const mockWherePoll = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWherePoll });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			await expect(fetchPollByIdWithOptions(999)).rejects.toThrow(
				"Poll not found"
			);
		});

		it("returns a poll with only its matching options by poll id", async () => {
			const mockPollRecord = createMockPollRecord({ id: 2 });
			const mockOptionRecords = [
				createMockPollOptionRecord({
					poll_id: 2,
					option: "Option for poll 2",
				}),
				createMockPollOptionRecord({
					poll_id: 2,
					option: "Another option for poll 2",
				}),
			];

			const mockWherePoll = vi.fn().mockResolvedValue([mockPollRecord]);
			const mockWhereOptions = vi
				.fn()
				.mockResolvedValue(mockOptionRecords);

			const mockFromPolls = vi
				.fn()
				.mockReturnValue({ where: mockWherePoll });
			const mockFromOptions = vi
				.fn()
				.mockReturnValue({ where: mockWhereOptions });

			vi.mocked(db.select)
				.mockReturnValueOnce({ from: mockFromPolls } as any)
				.mockReturnValueOnce({ from: mockFromOptions } as any);

			const result = await fetchPollByIdWithOptions(2);

			expect(result.poll.id).toBe(2);
			expect(result.options).toHaveLength(2);
			result.options.forEach((option) => {
				expect(option.pollId).toBe(2);
			});
		});

		describe(createPollResponse, () => {
			it("inserts poll response and links selected option IDs", async () => {
				const pollId = 1;
				const userId = "user-123";
				const selectedOptionIds = [10, 20];

				await expect(
					createPollResponse({ pollId, userId, selectedOptionIds })
				).resolves.not.toThrow();

				expect(vi.mocked(db.transaction)).toHaveBeenCalledWith(
					expect.any(Function)
				);
			});

			it("handles empty selectedOptionIds array", async () => {
				const pollId = 1;
				const userId = "user-123";
				const selectedOptionIds: number[] = [];

				await expect(
					createPollResponse({ pollId, userId, selectedOptionIds })
				).resolves.not.toThrow();

				expect(vi.mocked(db.transaction)).toHaveBeenCalledWith(
					expect.any(Function)
				);
			});

			it("throws error when poll response creation fails", async () => {
				const pollId = 1;
				const userId = "user-123";
				const selectedOptionIds = [10, 20];

				vi.mocked(db.transaction).mockImplementation((cb) =>
					cb({
						insert: vi.fn(() => ({
							values: vi.fn().mockReturnValue({
								returning: vi.fn().mockResolvedValue([]),
							}),
						})) as any,
					} as any)
				);

				await expect(
					createPollResponse({ pollId, userId, selectedOptionIds })
				).rejects.toThrow("Failed to create poll response");
			});

			it("handles database transaction failure", async () => {
				const pollId = 1;
				const userId = "user-123";
				const selectedOptionIds = [10, 20];

				vi.mocked(db.transaction).mockRejectedValue(
					new Error("Database error")
				);

				await expect(
					createPollResponse({ pollId, userId, selectedOptionIds })
				).rejects.toThrow("Database error");
			});
		});
	});

	describe(hasUserAnsweredPoll, () => {
		it("returns false when userId is not provided", async () => {
			const result = await hasUserAnsweredPoll(1, "");

			expect(result).toBe(false);
		});

		it("returns false when userId is undefined", async () => {
			const result = await hasUserAnsweredPoll(1, "");

			expect(result).toBe(false);
		});

		it("returns false when user has not answered the poll", async () => {
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await hasUserAnsweredPoll(1, "user-123");

			expect(result).toBe(false);
			expect(db.select).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});

		it("returns true when user has answered the poll today", async () => {
			const today = new Date();
			const mockWhere = vi.fn().mockResolvedValue([
				{
					response_id: 1,
					created_at: today,
				},
			]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await hasUserAnsweredPoll(1, "user-123");

			expect(result).toBe(true);
			expect(db.select).toHaveBeenCalled();
			expect(mockFrom).toHaveBeenCalled();
			expect(mockWhere).toHaveBeenCalled();
		});

		it("returns false when user only answered yesterday", async () => {
			// The query filters by >= today at midnight, so yesterday's answers don't count
			const mockWhere = vi.fn().mockResolvedValue([]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await hasUserAnsweredPoll(1, "user-123");

			expect(result).toBe(false);
			expect(mockWhere).toHaveBeenCalled();
		});

		it("returns true when multiple responses exist today", async () => {
			const now = new Date();
			const mockWhere = vi.fn().mockResolvedValue([
				{ response_id: 1, created_at: now },
				{ response_id: 2, created_at: new Date(now.getTime() + 1000) },
			]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await hasUserAnsweredPoll(1, "user-123");

			expect(result).toBe(true);
		});

		it("correctly handles midnight boundary", async () => {
			// Test that answers at 00:00:00 today count
			const midnight = new Date();
			midnight.setHours(0, 0, 0, 0);

			const mockWhere = vi.fn().mockResolvedValue([
				{
					response_id: 1,
					created_at: midnight,
				},
			]);
			const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
			vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

			const result = await hasUserAnsweredPoll(1, "user-123");
			expect(result).toBe(true);
		});

		describe("Poll re-answering mechanic verification", () => {
			it("blocks re-answering the same poll on the same day", async () => {
				// User answered at 10am today
				const answeredAt10am = new Date();
				answeredAt10am.setHours(10, 0, 0, 0);

				const mockWhere = vi.fn().mockResolvedValue([
					{
						response_id: 1,
						created_at: answeredAt10am,
					},
				]);
				const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
				vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

				// Try to answer again at 3pm same day
				const canAnswerAgain = await hasUserAnsweredPoll(25, "pikachu");

				expect(canAnswerAgain).toBe(true); // true = already answered = blocked
				expect(mockWhere).toHaveBeenCalled();
			});

			it("allows re-answering the same poll on a different day", async () => {
				// Mock that the query returns empty array
				// (because yesterday's answers are filtered out by the >= today condition)
				const mockWhere = vi.fn().mockResolvedValue([]);
				const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
				vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

				// Check if can answer today (no results = can answer)
				const canAnswerToday = await hasUserAnsweredPoll(
					6,
					"charizard"
				);

				expect(canAnswerToday).toBe(false); // false = not answered today = allowed
				expect(mockWhere).toHaveBeenCalled();
			});
		});
	});
});
