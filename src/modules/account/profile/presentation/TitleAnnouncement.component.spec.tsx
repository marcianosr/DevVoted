import { QueryClientProvider } from "@tanstack/react-query";

import { createTestQueryClient } from "~/test/queryClient.harness";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getArchiveState } from "~/modules/account/profile/application/archive.serverfn";
import { saveLook } from "~/modules/account/profile/application/look.serverfn";
import {
	acknowledgeTitles,
	getTitleAnnouncement,
	getTitleState,
} from "~/modules/account/profile/application/title.serverfn";
import { TitleAnnouncement } from "~/modules/account/profile/presentation/TitleAnnouncement.component";

vi.mock("~/modules/account/profile/application/archive.serverfn", () => ({
	getArchiveState: vi.fn(),
}));

vi.mock("~/modules/account/profile/application/look.serverfn", () => ({
	saveLook: vi.fn(),
}));

vi.mock("~/modules/account/profile/application/title.serverfn", () => ({
	acknowledgeTitles: vi.fn(),
	getTitleAnnouncement: vi.fn(),
	getTitleState: vi.fn(),
}));

const MISTY = "misty-cerulean-city";
const GREEN_BUILD = "border-00b9a62e";
const SHIP_IT = "title-rank-poll-newbie";
const TESTER = "title-legacy-tester";
const CSS_CARRIER = "title-answered-css";
const BIKESHEDDER = "title-it-compiles";
const AT_CAP_NOTE =
	"You already wear 3 titles. Take one off on your profile first.";

const ok = <T,>(data: T): { success: true; data: T } => ({
	success: true,
	data,
});

const announcing = (titleIds: string[]) =>
	ok({ titleIds, archivedRunStartedAt: null, legacyBonusBytes: null });

const wearing = (equippedTitleIds: string[], ownedTitleIds: string[]) =>
	ok({ equippedTitleIds, ownedTitleIds, pollsAnswered: 0, counts: [] });

const ARCHIVE = ok({
	archivedStorage: 0,
	ownedBorderIds: [GREEN_BUILD],
	equippedBorderId: GREEN_BUILD,
	ownedSwatchIds: [],
	equippedSwatchId: null,
});

const renderAnnouncement = () =>
	render(
		<QueryClientProvider client={createTestQueryClient()}>
			<TitleAnnouncement userId={MISTY} />
		</QueryClientProvider>
	);

describe("TitleAnnouncement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getArchiveState).mockResolvedValue(ARCHIVE);
		vi.mocked(saveLook).mockResolvedValue(
			ok({ borderId: GREEN_BUILD, titleIds: [], swatchId: null })
		);
		vi.mocked(acknowledgeTitles).mockResolvedValue(ok({ acknowledged: [] }));
	});

	it("wears every granted title still off the card in one save, then acknowledges them", async () => {
		vi.mocked(getTitleAnnouncement).mockResolvedValue(
			announcing([SHIP_IT, TESTER])
		);
		vi.mocked(getTitleState).mockResolvedValue(
			wearing([CSS_CARRIER], [SHIP_IT, TESTER, CSS_CARRIER])
		);
		const user = userEvent.setup();
		renderAnnouncement();

		await user.click(
			await screen.findByRole("button", { name: "Wear the titles" })
		);

		await waitFor(() =>
			expect(acknowledgeTitles).toHaveBeenCalledWith({
				data: { titleIds: [SHIP_IT, TESTER] },
			})
		);
		expect(saveLook).toHaveBeenCalledExactlyOnceWith({
			data: {
				borderId: GREEN_BUILD,
				titleIds: [CSS_CARRIER, SHIP_IT, TESTER],
				swatchId: null,
			},
		});
	});

	it("holds the press and says why when the card is already full", async () => {
		vi.mocked(getTitleAnnouncement).mockResolvedValue(
			announcing([BIKESHEDDER])
		);
		vi.mocked(getTitleState).mockResolvedValue(
			wearing(
				[SHIP_IT, TESTER, CSS_CARRIER],
				[SHIP_IT, TESTER, CSS_CARRIER, BIKESHEDDER]
			)
		);
		renderAnnouncement();

		expect(await screen.findByText(AT_CAP_NOTE)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^Wear the title/ })
		).toBeDisabled();
		expect(saveLook).not.toHaveBeenCalled();
	});

	it("acknowledges without wearing when the player presses Later", async () => {
		vi.mocked(getTitleAnnouncement).mockResolvedValue(announcing([SHIP_IT]));
		vi.mocked(getTitleState).mockResolvedValue(wearing([], [SHIP_IT]));
		const user = userEvent.setup();
		renderAnnouncement();

		await user.click(await screen.findByRole("button", { name: "Later" }));

		await waitFor(() =>
			expect(acknowledgeTitles).toHaveBeenCalledWith({
				data: { titleIds: [SHIP_IT] },
			})
		);
		expect(saveLook).not.toHaveBeenCalled();
	});
});
