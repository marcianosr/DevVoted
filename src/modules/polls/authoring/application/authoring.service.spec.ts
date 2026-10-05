import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	acknowledgeApprovals,
	editPoll,
	getApprovalNotice,
	suggestPoll,
} from "~/modules/polls/authoring/application/authoring.service";
import * as authoringRepository from "~/modules/polls/authoring/infrastructure/authoring.repository";
import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import { ADMIN_REQUIRED } from "~/shared/utils/authorization";

vi.mock(
	"~/modules/polls/authoring/infrastructure/authoring.repository",
	() => ({
		createPollWithOptions: vi.fn(),
		updatePollWithOptions: vi.fn(),
		fetchUnannouncedPublishedPolls: vi.fn(),
		markPollsAnnounced: vi.fn(),
	})
);

const BROCK = "11111111-1111-4111-8111-111111111111";
const OAK = "22222222-2222-4222-8222-222222222222";

const brock = { userId: BROCK, isAdmin: false };
const oak = { userId: OAK, isAdmin: true };

const suggestion = {
	poll: {
		question: "What does `flex: 1` expand to?",
		status: "published" as const,
		answerType: "single" as const,
		categoryCode: "css",
		explanation: "`flex: 1` is `1 1 0%`.",
	},
	options: [
		{ option: "1 1 0%", correct: true },
		{ option: "1 1 auto", correct: false },
		{ option: "1 0 0%", correct: false },
	],
};

const edit = {
	id: 74,
	poll: { question: "What does `flex: 1` expand to in CSS?" },
	options: [
		{ id: 1, option: "1 1 0%", correct: true },
		{ option: "1 1 auto", correct: false },
		{ option: "1 0 0%", correct: false },
	],
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(authoringRepository.createPollWithOptions).mockResolvedValue(
		createMockPoll()
	);
	vi.mocked(authoringRepository.updatePollWithOptions).mockResolvedValue(
		createMockPoll({ id: 74 })
	);
});

describe("suggestPoll", () => {
	it("writes the suggestion as a draft by its author, whatever status it was sent with", async () => {
		await suggestPoll(brock, suggestion);

		expect(authoringRepository.createPollWithOptions).toHaveBeenCalledWith(
			{ ...suggestion.poll, status: "draft", createdBy: BROCK },
			suggestion.options
		);
	});

	it("hands the explanation to the repository", async () => {
		await suggestPoll(brock, suggestion);

		expect(authoringRepository.createPollWithOptions).toHaveBeenCalledWith(
			expect.objectContaining({ explanation: "`flex: 1` is `1 1 0%`." }),
			suggestion.options
		);
	});
});

describe("editPoll", () => {
	it("refuses a player before the repository sees the edit", async () => {
		const result = await editPoll(brock, edit);

		expect(result).toEqual({ success: false, error: ADMIN_REQUIRED });
		expect(authoringRepository.updatePollWithOptions).not.toHaveBeenCalled();
	});

	it("writes an admin's edit with the options as sent", async () => {
		const result = await editPoll(oak, edit);

		expect(authoringRepository.updatePollWithOptions).toHaveBeenCalledWith(
			74,
			edit.poll,
			edit.options
		);
		expect(result).toEqual({ success: true, data: createMockPoll({ id: 74 }) });
	});
});

describe("getApprovalNotice", () => {
	const flex = { id: 74, question: "What does `flex: 1` expand to?" };

	it("hands a player their published polls the dialog has not shown", async () => {
		vi.mocked(
			authoringRepository.fetchUnannouncedPublishedPolls
		).mockResolvedValueOnce([flex]);

		const result = await getApprovalNotice(brock);

		expect(result).toEqual({ success: true, data: { polls: [flex] } });
		expect(
			authoringRepository.fetchUnannouncedPublishedPolls
		).toHaveBeenCalledWith(BROCK);
	});

	it("hands an admin nothing, because an admin's own poll pays nothing", async () => {
		const result = await getApprovalNotice(oak);

		expect(result).toEqual({ success: true, data: { polls: [] } });
		expect(
			authoringRepository.fetchUnannouncedPublishedPolls
		).not.toHaveBeenCalled();
	});
});

describe("acknowledgeApprovals", () => {
	it("stamps the named polls announced for their author", async () => {
		await acknowledgeApprovals(BROCK, [74]);

		expect(authoringRepository.markPollsAnnounced).toHaveBeenCalledWith(
			BROCK,
			[74]
		);
	});
});
