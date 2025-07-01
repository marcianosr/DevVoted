import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	fetchAllPolls,
	fetchPollById,
	fetchPollByIdWithOptions,
} from "~/domains/polls/api/queries";
import { db } from "~/database/db";
import {
	createMockPollRecordArray,
	createMockPollRecord,
} from "~/domains/polls/factories/poll";
import { createMockPollOptionRecord } from "../factories/pollOption";

// Mock the database module
vi.mock("~/database/db", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("Query logic - DTO mapping - DB errors", () => {
	beforeEach(() => {
		vi.resetAllMocks();
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
	});
});
