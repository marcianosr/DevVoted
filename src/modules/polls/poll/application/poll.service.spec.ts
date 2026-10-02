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
import { createMockPollOptionArray } from "~/modules/polls/poll/domain/pollOption.factory";
import * as pollRepository from "~/modules/polls/poll/infrastructure/poll.repository";

vi.mock("~/modules/polls/poll/infrastructure/poll.repository", () => ({
	fetchPollsIn: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
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

		const result = await listPollsFor(brock);

		expect(pollRepository.fetchPollsIn).toHaveBeenCalledWith({
			kind: "authoredBy",
			authorId: BROCK,
		});
		expect(result).toEqual({
			success: true,
			data: { polls, canAdminister: false },
		});
	});

	it("asks an admin's list for every poll and says they administer", async () => {
		vi.mocked(pollRepository.fetchPollsIn).mockResolvedValue([]);

		const result = await listPollsFor(oak);

		expect(pollRepository.fetchPollsIn).toHaveBeenCalledWith({ kind: "every" });
		expect(result).toEqual({
			success: true,
			data: { polls: [], canAdminister: true },
		});
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
