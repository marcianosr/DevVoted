import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllPolls } from "@/src/domains/polls/api/queries";
import { db } from "~/database/db";
import { createMockPollRecordArray } from "@/src/domains/polls/factories/pollFactory";

// Mock the database module
vi.mock("~/database/db", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("Queries to fetch polls", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe(fetchAllPolls, () => {
		it("returns all polls transformed to DTOs", async () => {
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
});
