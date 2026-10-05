import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getArchiveState } from "~/modules/account/profile/application/archive.serverfn";
import { getTitleAnnouncement } from "~/modules/account/profile/application/title.serverfn";
import {
	acknowledgePollApprovals,
	getPollApprovalNotice,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import { PollApprovedAnnouncement } from "~/modules/polls/authoring/presentation/PollApprovedAnnouncement.component";
import { STORAGE_UNITS } from "~/shared/lib/storage";
import { createTestQueryClient } from "~/test/queryClient.harness";

vi.mock("~/modules/account/profile/application/archive.serverfn", () => ({
	getArchiveState: vi.fn(),
}));

vi.mock("~/modules/account/profile/application/title.serverfn", () => ({
	acknowledgeTitles: vi.fn(),
	getTitleAnnouncement: vi.fn(),
}));

vi.mock("~/modules/polls/authoring/application/authoring.serverfn", () => ({
	acknowledgePollApprovals: vi.fn(),
	getPollApprovalNotice: vi.fn(),
}));

const BROCK = "brock-pewter-city";
const flex = { id: 74, question: "What does `flex: 1` expand to?" };

const ok = <T,>(data: T): { success: true; data: T } => ({
	success: true,
	data,
});

const announcingTitles = (titleIds: string[]) =>
	ok({ titleIds, archivedRunStartedAt: null, legacyBonusBytes: null });

const ARCHIVE = ok({
	archivedStorage: 512 * STORAGE_UNITS.KB,
	ownedBorderIds: [],
	equippedBorderId: null,
	ownedSwatchIds: [],
	equippedSwatchId: null,
});

const renderAnnouncement = () =>
	render(
		<QueryClientProvider client={createTestQueryClient()}>
			<PollApprovedAnnouncement userId={BROCK} />
		</QueryClientProvider>
	);

describe("PollApprovedAnnouncement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getArchiveState).mockResolvedValue(ARCHIVE);
		vi.mocked(getTitleAnnouncement).mockResolvedValue(announcingTitles([]));
		vi.mocked(getPollApprovalNotice).mockResolvedValue(ok({ polls: [flex] }));
		vi.mocked(acknowledgePollApprovals).mockResolvedValue(
			ok({ acknowledged: [74] })
		);
	});

	it("announces the live poll and acknowledges it on close", async () => {
		const user = userEvent.setup();
		renderAnnouncement();

		expect(
			await screen.findByRole("dialog", { name: "Poll published!" })
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Close" }));

		await waitFor(() =>
			expect(acknowledgePollApprovals).toHaveBeenCalledWith({
				data: { pollIds: [74] },
			})
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
		);
	});

	it("waits while a title grant is still on screen", async () => {
		vi.mocked(getTitleAnnouncement).mockResolvedValue(
			announcingTitles(["title-legacy-tester"])
		);
		renderAnnouncement();

		await waitFor(() => expect(getTitleAnnouncement).toHaveBeenCalled());
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("raises nothing when no poll went live", async () => {
		vi.mocked(getPollApprovalNotice).mockResolvedValue(ok({ polls: [] }));
		renderAnnouncement();

		await waitFor(() => expect(getPollApprovalNotice).toHaveBeenCalled());
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
