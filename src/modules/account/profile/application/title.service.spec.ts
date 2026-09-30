import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	acknowledgeTitlesService,
	getTitleAnnouncementService,
	getTitleStateService,
} from "~/modules/account/profile/application/title.service";

const {
	fetchUnannouncedTitleIds,
	markTitlesAnnounced,
	fetchArchivedRunStartedAt,
	fetchLegacyBonusBytes,
	fetchUserTitleState,
	fetchObjectiveProgressByUser,
	fetchCategoryPollCounts,
} = vi.hoisted(() => ({
	fetchUserTitleState: vi.fn(),
	fetchObjectiveProgressByUser: vi.fn(),
	fetchCategoryPollCounts: vi.fn(),
	fetchUnannouncedTitleIds: vi.fn(),
	markTitlesAnnounced: vi.fn(),
	fetchArchivedRunStartedAt: vi.fn(),
	fetchLegacyBonusBytes: vi.fn(),
}));

vi.mock("~/modules/account/profile/infrastructure/title.repository", () => ({
	fetchUnannouncedTitleIds,
	markTitlesAnnounced,
	fetchUserTitleState,
	setEquippedTitles: vi.fn(),
}));

vi.mock("~/modules/collection/dex/infrastructure/configdex.repository", () => ({
	fetchObjectiveProgressByUser,
}));

vi.mock("~/modules/run/run/infrastructure/run.repository", () => ({
	fetchCategoryPollCounts,
}));

vi.mock("~/modules/account/profile/infrastructure/legacy.repository", () => ({
	fetchArchivedRunStartedAt,
	fetchLegacyBonusBytes,
}));

const RED = "red-from-pallet-town";
const CUTOVER = new Date("2026-08-14T09:00:00Z");
const PLAYED_CREDIT = 262144;
const TESTER = "title-legacy-tester";
const SUMMIT = "title-summit";

const NOTHING = {
	titleIds: [],
	archivedRunStartedAt: null,
	legacyBonusBytes: null,
};

describe("getTitleStateService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("hands the shelf every counted metric and the distinct category polls, so a category bar can read its own count", async () => {
		const counters = [{ metric: "polls-answered", count: 34 }];
		const categoryPolls = [
			{ metric: "category-seen:css", count: 20 },
			{ metric: "category-mastered:css", count: 14 },
		];
		fetchUserTitleState.mockResolvedValueOnce({
			ownedTitleIds: [],
			equippedTitleIds: [],
		});
		fetchObjectiveProgressByUser.mockResolvedValueOnce(counters);
		fetchCategoryPollCounts.mockResolvedValueOnce(categoryPolls);

		expect(await getTitleStateService(RED)).toEqual({
			success: true,
			data: {
				ownedTitleIds: [],
				equippedTitleIds: [],
				pollsAnswered: 34,
				counts: [...counters, ...categoryPolls],
			},
		});
	});
});

describe("getTitleAnnouncementService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchArchivedRunStartedAt.mockResolvedValue(null);
		fetchLegacyBonusBytes.mockResolvedValue(null);
	});

	it("announces nothing, and opens no legacy row, when every title has been shown", async () => {
		fetchUnannouncedTitleIds.mockResolvedValue([]);

		expect(await getTitleAnnouncementService(RED)).toEqual({
			success: true,
			data: NOTHING,
		});
		expect(fetchArchivedRunStartedAt).not.toHaveBeenCalled();
		expect(fetchLegacyBonusBytes).not.toHaveBeenCalled();
	});

	it("reads the archived run and the credit once a granted title is waiting", async () => {
		fetchUnannouncedTitleIds.mockResolvedValue([TESTER]);
		fetchArchivedRunStartedAt.mockResolvedValue(CUTOVER);
		fetchLegacyBonusBytes.mockResolvedValue(PLAYED_CREDIT);

		expect(await getTitleAnnouncementService(RED)).toEqual({
			success: true,
			data: {
				titleIds: [TESTER],
				archivedRunStartedAt: CUTOVER.toISOString(),
				legacyBonusBytes: PLAYED_CREDIT,
			},
		});
	});

	it("leaves the archive and the credit out of an earned title's announcement", async () => {
		fetchUnannouncedTitleIds.mockResolvedValue([SUMMIT]);

		expect(await getTitleAnnouncementService(RED)).toEqual({
			success: true,
			data: { ...NOTHING, titleIds: [SUMMIT] },
		});
		expect(fetchArchivedRunStartedAt).not.toHaveBeenCalled();
		expect(fetchLegacyBonusBytes).not.toHaveBeenCalled();
	});

	it("still reads the legacy rows when a granted title waits beside an earned one", async () => {
		fetchUnannouncedTitleIds.mockResolvedValue([SUMMIT, TESTER]);
		fetchLegacyBonusBytes.mockResolvedValue(PLAYED_CREDIT);

		const response = await getTitleAnnouncementService(RED);

		expect(response.success && response.data.legacyBonusBytes).toBe(
			PLAYED_CREDIT
		);
	});

	it("reports a null credit for a legacy account the migration never paid", async () => {
		fetchUnannouncedTitleIds.mockResolvedValue([TESTER]);

		expect(await getTitleAnnouncementService(RED)).toEqual({
			success: true,
			data: { ...NOTHING, titleIds: [TESTER] },
		});
	});
});

describe("acknowledgeTitlesService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		markTitlesAnnounced.mockResolvedValue(undefined);
	});

	it("stamps only the titles it was handed", async () => {
		expect(await acknowledgeTitlesService(RED, [TESTER])).toEqual({
			success: true,
			data: { acknowledged: [TESTER] },
		});
		expect(markTitlesAnnounced).toHaveBeenCalledWith(RED, [TESTER]);
	});
});
