import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	listPollsFor,
	pollDetailFor,
} from "~/modules/polls/poll/application/poll.service";
import {
	createMockPoll,
	createMockPollArray,
} from "~/modules/polls/poll/domain/poll.factory";
import { ACCESS_DENIED } from "~/modules/polls/poll/domain/pollAccess.model";
import { TEST_DATES } from "~/test/kanto";
import { createMockPollOptionArray } from "~/modules/polls/poll/domain/pollOption.factory";
import * as pollRepository from "~/modules/polls/poll/infrastructure/poll.repository";

vi.mock("~/modules/polls/poll/infrastructure/poll.repository", () => ({
	fetchPollsIn: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
	fetchDealCounts: vi.fn(async () => []),
	fetchDealtPollIdsOn: vi.fn(async () => []),
}));

const BROCK = "11111111-1111-4111-8111-111111111111";
const MISTY = "22222222-2222-4222-8222-222222222222";
const POLL_ID = 74;

const brock = { userId: BROCK, isAdmin: false };
const oak = { userId: MISTY, isAdmin: true };

beforeEach(() => {
	vi.clearAllMocks();
});

describe("listPollsFor", () => {
	it("asks a player's list for only the polls they authored", async () => {
		const polls = createMockPollArray(2);
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue(polls);

		const result = await listPollsFor(brock, TEST_DATES.christmas);

		expect(pollRepository.fetchPollsIn).toHaveBeenCalledWith({
			kind: "authoredBy",
			authorId: BROCK,
		});
		expect(result).toEqual({
			success: true,
			data: { polls, canAdminister: false, deals: [], yesterday: [] },
		});
	});

	it("counts how often each listed poll was dealt, and only the listed ones", async () => {
		const polls = createMockPollArray(2);
		const deals = [{ pollId: polls[0]!.id, times: 3 }];
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue(polls);
		vi.mocked(pollRepository.fetchDealCounts).mockResolvedValueOnce(deals);

		const result = await listPollsFor(brock, TEST_DATES.christmas);

		expect(pollRepository.fetchDealCounts).toHaveBeenCalledWith(
			polls.map((poll) => poll.id)
		);
		expect(result.success && result.data.deals).toEqual(deals);
	});

	it("asks an admin's list for every poll and says they administer", async () => {
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue([]);

		const result = await listPollsFor(oak, TEST_DATES.christmas);

		expect(pollRepository.fetchPollsIn).toHaveBeenCalledWith({ kind: "every" });
		expect(result).toEqual({
			success: true,
			data: { polls: [], canAdminister: true, deals: [], yesterday: [] },
		});
	});

	it("hands an admin the five polls dealt the day before, in dealt order", async () => {
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue([]);
		vi.mocked(pollRepository.fetchDealtPollIdsOn).mockResolvedValueOnce([
			151, 25, 1, 4, 7,
		]);

		const result = await listPollsFor(oak, TEST_DATES.christmas);

		expect(pollRepository.fetchDealtPollIdsOn).toHaveBeenCalledWith(
			TEST_DATES.christmasEve
		);
		expect(result.success && result.data.yesterday).toEqual([151, 25, 1, 4, 7]);
	});

	it("never reads yesterday's deal for a player", async () => {
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue([]);

		await listPollsFor(brock, TEST_DATES.christmas);

		expect(pollRepository.fetchDealtPollIdsOn).not.toHaveBeenCalled();
	});
});

describe("pollDetailFor", () => {
	const options = createMockPollOptionArray(POLL_ID);

	const repositoryReturns = (createdBy: string) =>
		vi.mocked(pollRepository.fetchPollByIdWithOptions).mockResolvedValue({
			poll: createMockPoll({ id: POLL_ID, createdBy }),
			options,
		});

	it("hands a player their own poll without admin rights", async () => {
		repositoryReturns(BROCK);

		const result = await pollDetailFor(brock, POLL_ID);

		expect(result).toEqual({
			success: true,
			data: {
				poll: createMockPoll({ id: POLL_ID, createdBy: BROCK }),
				options,
				canAdminister: false,
			},
		});
	});

	it("refuses a player a poll someone else authored", async () => {
		repositoryReturns(MISTY);

		expect(await pollDetailFor(brock, POLL_ID)).toEqual({
			success: false,
			error: ACCESS_DENIED,
		});
	});

	it("hands an admin someone else's poll with admin rights", async () => {
		repositoryReturns(BROCK);

		const result = await pollDetailFor(oak, POLL_ID);

		expect(result.success && result.data.canAdminister).toBe(true);
	});

	it("fails when the poll does not exist", async () => {
		vi.mocked(pollRepository.fetchPollByIdWithOptions).mockRejectedValue(
			new Error("Poll not found")
		);

		expect(await pollDetailFor(oak, 123)).toEqual({
			success: false,
			error: "Poll not found",
		});
		expect(pollRepository.fetchPollByIdWithOptions).toHaveBeenCalledWith(123);
	});
});
