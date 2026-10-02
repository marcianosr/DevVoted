import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import {
	canAdministerPolls,
	isInPollScope,
	maySeePoll,
	pollScopeOf,
	type PollViewer,
} from "~/modules/polls/poll/domain/pollAccess.model";

const BROCK = "11111111-1111-4111-8111-111111111111";
const MISTY = "22222222-2222-4222-8222-222222222222";

const brock: PollViewer = { userId: BROCK, isAdmin: false };
const oak: PollViewer = { userId: MISTY, isAdmin: true };

const brocksPoll = createMockPoll({ id: 74, createdBy: BROCK });
const mistysPoll = createMockPoll({ id: 120, createdBy: MISTY });

describe("pollScopeOf", () => {
	it("gives an admin every poll", () => {
		expect(pollScopeOf(oak)).toEqual({ kind: "every" });
	});

	it("gives a player only the polls they authored", () => {
		expect(pollScopeOf(brock)).toEqual({ kind: "authoredBy", authorId: BROCK });
	});
});

describe("isInPollScope", () => {
	it("holds every poll inside the every scope", () => {
		expect(isInPollScope({ kind: "every" }, brocksPoll)).toBe(true);
		expect(isInPollScope({ kind: "every" }, mistysPoll)).toBe(true);
	});

	it("holds a poll inside its author's scope", () => {
		expect(
			isInPollScope({ kind: "authoredBy", authorId: BROCK }, brocksPoll)
		).toBe(true);
	});

	it("keeps another author's poll outside an author scope", () => {
		expect(
			isInPollScope({ kind: "authoredBy", authorId: BROCK }, mistysPoll)
		).toBe(false);
	});
});

describe("maySeePoll", () => {
	it("lets a player see a poll they authored", () => {
		expect(maySeePoll(brock, brocksPoll)).toBe(true);
	});

	it("refuses a player a poll someone else authored", () => {
		expect(maySeePoll(brock, mistysPoll)).toBe(false);
	});

	it("lets an admin see a poll someone else authored", () => {
		expect(maySeePoll(oak, brocksPoll)).toBe(true);
	});

	it("lets an admin see a poll they authored", () => {
		expect(maySeePoll(oak, mistysPoll)).toBe(true);
	});

	it("agrees with the list scope for every viewer and poll pairing", () => {
		const viewers = [brock, oak, { userId: MISTY, isAdmin: false }];
		const polls = [brocksPoll, mistysPoll];

		viewers.forEach((viewer) =>
			polls.forEach((poll) =>
				expect(maySeePoll(viewer, poll)).toBe(
					isInPollScope(pollScopeOf(viewer), poll)
				)
			)
		);
	});
});

describe("canAdministerPolls", () => {
	it("lets an admin administer polls", () => {
		expect(canAdministerPolls(oak)).toBe(true);
	});

	it("refuses a player, even over polls they authored", () => {
		expect(canAdministerPolls(brock)).toBe(false);
		expect(maySeePoll(brock, brocksPoll)).toBe(true);
	});
});
