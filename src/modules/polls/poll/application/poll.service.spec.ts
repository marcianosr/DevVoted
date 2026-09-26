import { describe, it, expect, vi, beforeEach } from "vitest";

import * as pollRepository from "~/modules/polls/poll/infrastructure/poll.repository";

import {
	getAllPollsService,
	getPollByIdWithOptionsService,
} from "./poll.service";
import { createMockPoll, createMockPollArray } from "../domain/poll.factory";
import { createMockPollOptionArray } from "../domain/pollOption.factory";

vi.mock("~/modules/polls/poll/infrastructure/poll.repository", () => ({
	fetchAllPolls: vi.fn(),
	fetchPollByIdWithOptions: vi.fn(),
	fetchPollsByUser: vi.fn(),
	fetchPollCreators: vi.fn(),
	hasUserAnsweredPoll: vi.fn(),
}));

const BLAINE_ID = "123e4567-e89b-12d3-a456-426614174000";
const POLL_ID = 2;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getAllPollsService", () => {
	it("returns every poll the repository yields", async () => {
		const polls = createMockPollArray(10);
		vi.mocked(pollRepository.fetchAllPolls).mockResolvedValue(polls);

		expect(await getAllPollsService()).toEqual({ success: true, data: polls });
	});

	it("succeeds with an empty list when there are no polls", async () => {
		vi.mocked(pollRepository.fetchAllPolls).mockResolvedValue([]);

		expect(await getAllPollsService()).toEqual({ success: true, data: [] });
	});
});

describe("getPollByIdWithOptionsService", () => {
	const poll = createMockPoll({ id: POLL_ID });
	const options = createMockPollOptionArray(POLL_ID);

	const repositoryReturnsPoll = () =>
		vi
			.mocked(pollRepository.fetchPollByIdWithOptions)
			.mockResolvedValue({ poll, options });

	it("reports hasAnswered false when the user has not answered today", async () => {
		repositoryReturnsPoll();
		vi.mocked(pollRepository.hasUserAnsweredPoll).mockResolvedValue(false);

		const result = await getPollByIdWithOptionsService({
			id: POLL_ID,
			userId: BLAINE_ID,
		});

		expect(pollRepository.hasUserAnsweredPoll).toHaveBeenCalledWith(
			POLL_ID,
			BLAINE_ID
		);
		expect(result).toEqual({
			success: true,
			data: { poll, options, hasAnswered: false },
		});
	});

	it("reports hasAnswered true when the user has already answered", async () => {
		repositoryReturnsPoll();
		vi.mocked(pollRepository.hasUserAnsweredPoll).mockResolvedValue(true);

		const result = await getPollByIdWithOptionsService({
			id: POLL_ID,
			userId: BLAINE_ID,
		});

		expect(result).toEqual({
			success: true,
			data: { poll, options, hasAnswered: true },
		});
	});

	it("skips the answered lookup entirely when no userId is given", async () => {
		repositoryReturnsPoll();

		const result = await getPollByIdWithOptionsService({ id: POLL_ID });

		expect(pollRepository.hasUserAnsweredPoll).not.toHaveBeenCalled();
		expect(result).toEqual({
			success: true,
			data: { poll, options, hasAnswered: false },
		});
	});

	it("returns a failure when the poll does not exist", async () => {
		vi.mocked(pollRepository.fetchPollByIdWithOptions).mockRejectedValue(
			new Error("Poll not found")
		);

		const result = await getPollByIdWithOptionsService({ id: 123 });

		expect(pollRepository.fetchPollByIdWithOptions).toHaveBeenCalledWith(123);
		expect(result).toEqual({ success: false, error: "Poll not found" });
	});
});
