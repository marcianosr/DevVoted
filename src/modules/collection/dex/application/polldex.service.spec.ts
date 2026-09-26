import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPolldexService } from "~/modules/collection/dex/application/polldex.service";
import * as queries from "~/modules/collection/dex/infrastructure/polldex.repository";
import type { PolldexCorrectnessRow } from "~/modules/collection/dex/infrastructure/polldex.repository";

vi.mock("~/modules/collection/dex/infrastructure/polldex.repository", () => ({
	fetchPublishedPollsForDex: vi.fn(),
	fetchSeenCountsByUser: vi.fn(),
	fetchAnswerCorrectnessByUser: vi.fn(),
}));

const USER = "red-from-pallet-town";

const response = (
	responseId: number,
	pollId: number,
	{ correct }: { correct: boolean }
): PolldexCorrectnessRow[] => [
	{
		responseId,
		pollId,
		optionCorrect: true,
		optionSelected: correct ? 100 + responseId : null,
	},
	{
		responseId,
		pollId,
		optionCorrect: false,
		optionSelected: correct ? null : 200 + responseId,
	},
];

const mockQueries = ({
	polls = [],
	seen = [],
	correctness = [],
}: {
	polls?: Awaited<ReturnType<typeof queries.fetchPublishedPollsForDex>>;
	seen?: Awaited<ReturnType<typeof queries.fetchSeenCountsByUser>>;
	correctness?: PolldexCorrectnessRow[];
}) => {
	vi.mocked(queries.fetchPublishedPollsForDex).mockResolvedValue(polls);
	vi.mocked(queries.fetchSeenCountsByUser).mockResolvedValue(seen);
	vi.mocked(queries.fetchAnswerCorrectnessByUser).mockResolvedValue(
		correctness
	);
};

const unwrap = async () => {
	const result = await getPolldexService({ userId: USER });
	if (!result.success) throw new Error(result.error);
	return result.data.entries;
};

describe("getPolldexService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redacts an unseen poll: question null, seen false, zeroed stats", async () => {
		mockQueries({
			polls: [
				{ id: 1, pollNumber: 1, question: "Secret", categoryCode: "css" },
			],
		});

		const [entry] = await unwrap();

		expect(entry).toEqual({
			id: 1,
			pollNumber: 1,
			categoryCode: "css",
			seen: false,
			question: null,
			timesSeen: 0,
			answeredCount: 0,
			correctCount: 0,
			accuracy: null,
		});
	});

	it("computes accuracy as fully-correct answers over total answers", async () => {
		mockQueries({
			polls: [
				{ id: 7, pollNumber: 7, question: "Box model?", categoryCode: "css" },
			],
			seen: [{ pollId: 7, timesSeen: 5 }],
			correctness: [
				...response(1, 7, { correct: true }),
				...response(2, 7, { correct: true }),
				...response(3, 7, { correct: false }),
			],
		});

		const [entry] = await unwrap();

		expect(entry.seen).toBe(true);
		expect(entry.timesSeen).toBe(5);
		expect(entry.answeredCount).toBe(3);
		expect(entry.accuracy).toBe(67);
		expect(entry.question).toBe("Box model?");
	});

	it("keeps the fully-correct count, which a rounded accuracy cannot recover", async () => {
		mockQueries({
			polls: [
				{ id: 7, pollNumber: 7, question: "Box model?", categoryCode: "css" },
			],
			correctness: [
				...response(1, 7, { correct: true }),
				...response(2, 7, { correct: true }),
				...response(3, 7, { correct: false }),
			],
		});

		const [entry] = await unwrap();

		expect(entry.correctCount).toBe(2);
		expect(entry.answeredCount).toBe(3);
	});

	it("marks a poll seen via views alone, with null accuracy when never answered", async () => {
		mockQueries({
			polls: [
				{ id: 9, pollNumber: null, question: "Grid?", categoryCode: "css" },
			],
			seen: [{ pollId: 9, timesSeen: 2 }],
		});

		const [entry] = await unwrap();

		expect(entry.seen).toBe(true);
		expect(entry.timesSeen).toBe(2);
		expect(entry.answeredCount).toBe(0);
		expect(entry.accuracy).toBeNull();
		expect(entry.question).toBe("Grid?");
	});

	it("counts an answered poll as seen even when run view-history is empty", async () => {
		mockQueries({
			polls: [
				{ id: 386, pollNumber: 386, question: "CSS?", categoryCode: "css" },
			],
			seen: [],
			correctness: response(1, 386, { correct: false }),
		});

		const [entry] = await unwrap();

		expect(entry.seen).toBe(true);
		expect(entry.timesSeen).toBe(1);
		expect(entry.answeredCount).toBe(1);
		expect(entry.accuracy).toBe(0);
		expect(entry.question).toBe("CSS?");
	});

	it("orders entries by dex number (poll_number, else id)", async () => {
		mockQueries({
			polls: [
				{ id: 1, pollNumber: 322, question: "a", categoryCode: "css" },
				{ id: 2, pollNumber: 31, question: "b", categoryCode: "css" },
				{ id: 3, pollNumber: null, question: "c", categoryCode: "css" },
			],
		});

		const numbers = (await unwrap()).map(
			(entry) => entry.pollNumber ?? entry.id
		);

		expect(numbers).toEqual([3, 31, 322]);
	});

	it("drops polls whose category code is unknown", async () => {
		mockQueries({
			polls: [
				{ id: 1, pollNumber: 1, question: "Ok", categoryCode: "css" },
				{
					id: 2,
					pollNumber: 2,
					question: "Bad",
					categoryCode: "not-a-category",
				},
			],
		});

		const entries = await unwrap();

		expect(entries).toHaveLength(1);
		expect(entries[0].id).toBe(1);
	});
});
