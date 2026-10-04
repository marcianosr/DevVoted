import { describe, expect, it } from "vitest";

import {
	isOwnerTabId,
	isProfileTabId,
	OWNER_TAB_IDS,
	PROFILE_TABS,
	profileCardFor,
	profileClimbingFor,
	profileBestRunFor,
	profileCollectionFor,
	profileHeroFor,
	profileRunsFor,
	profileSeatsFor,
	triedOnBorderOf,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import type {
	ProfileIdentity,
	ProfileRecord,
	ProfileTotals,
} from "~/modules/account/profile/domain/profile.model";
import type { RunHistoryEntry } from "~/modules/collection/dex/domain/runHistory.model";
import type { Standing } from "~/modules/run/community/domain/standing.model";
import { NO_AUTHORSHIP } from "~/modules/account/profile/domain/authorship.model";
import { borders } from "~/modules/account/profile/domain/border.model";
import {
	DEX_TABS,
	runDetailFor,
} from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { standingFor } from "~/modules/run/community/application/playerCard.viewmodel";
import { kbLabel } from "~/shared/lib/storage";
import { TEST_DATES } from "~/test/kanto";

const IDENTITY: ProfileIdentity = {
	displayName: "marciano_schildmeijer",
	githubUsername: "marciano",
	photoUrl: "/editors/misty.png",
	borderUrl: "/borders/border-ts-lavender.svg",
	wornTitles: ["Git GOAT", "Summit"],
	pollsAnswered: 120,
	authorship: NO_AUTHORSHIP,
};

const BARE: ProfileIdentity = {
	displayName: "Brock",
	githubUsername: null,
	photoUrl: null,
	borderUrl: null,
	wornTitles: [],
	pollsAnswered: 0,
	authorship: NO_AUTHORSHIP,
};

describe("PROFILE_TABS", () => {
	it("carries every Dex tab, so the collection is whole", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		for (const tab of DEX_TABS) expect(ids).toContain(tab.id);
	});

	it("leads with the appearance tab and shelves borders and titles behind the collection", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		expect(ids[0]).toBe("appearance");
		expect(ids.slice(-2)).toEqual(["borders", "titles"]);
	});

	it("names each tab once, because the id is what the press reads", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("opens on the owner's appearance tab", () => {
		expect(isOwnerTabId(PROFILE_TABS[0].id)).toBe(true);
	});
});

describe("isProfileTabId", () => {
	it("admits a Dex tab", () => {
		expect(isProfileTabId("swatches")).toBe(true);
	});

	it("admits the appearance tab", () => {
		expect(isProfileTabId("appearance")).toBe(true);
	});

	it("accepts the borders and titles tabs the appearance panel links to", () => {
		expect(isProfileTabId("borders")).toBe(true);
		expect(isProfileTabId("titles")).toBe(true);
	});

	it("refuses anything else, so a stale press cannot set a dead tab", () => {
		expect(isProfileTabId("leaderboard")).toBe(false);
	});
});

describe("isOwnerTabId", () => {
	it("names only the owner's tabs, which a visitor never sees", () => {
		expect(OWNER_TAB_IDS.every(isOwnerTabId)).toBe(true);
		expect(isOwnerTabId("polls")).toBe(false);
	});
});

describe("profileCardFor", () => {
	it("names the player and every title they wear", () => {
		expect(profileCardFor(IDENTITY, false)).toMatchObject({
			name: "marciano_schildmeijer",
			titles: ["Git GOAT", "Summit"],
			handle: "marciano",
			photoUrl: "/editors/misty.png",
			borderUrl: "/borders/border-ts-lavender.svg",
		});
	});

	it("withholds a handle, photo and border the account does not have", () => {
		const card = profileCardFor(BARE, false);

		expect(card).not.toHaveProperty("handle");
		expect(card).not.toHaveProperty("photoUrl");
		expect(card).not.toHaveProperty("borderUrl");
	});

	it("still names a player wearing nothing, leaving the card to say so", () => {
		expect(profileCardFor(BARE, false)).toMatchObject({
			name: "Brock",
			titles: [],
		});
	});

	it("marks the card as yours when it is", () => {
		expect(profileCardFor(IDENTITY, true).you).toBe(true);
	});

	it("states no rank, because a poll-count rung is a title the player picks", () => {
		expect(profileCardFor(IDENTITY, false)).not.toHaveProperty("rank");
	});
});

describe("profileCollectionFor", () => {
	const TOTALS: ProfileTotals = {
		polls: { held: 9, total: 96 },
		configs: { held: 4, total: 30 },
		titles: { held: 2, total: 16 },
		archivedStorage: 8_388_608,
	};

	it("states each collection as held of total", () => {
		expect(profileCollectionFor(TOTALS).counts).toEqual([
			{ label: "polls", figure: "9 of 96", held: 9, total: 96 },
			{ label: "configs", figure: "4 of 30", held: 4, total: 30 },
			{ label: "titles", figure: "2 of 16", held: 2, total: 16 },
		]);
	});

	it("states a brand new account as zero rather than leaving it blank", () => {
		const fresh = profileCollectionFor({
			...TOTALS,
			polls: { held: 0, total: 96 },
			configs: { held: 0, total: 30 },
			titles: { held: 0, total: 16 },
		});

		expect(fresh.counts[0].figure).toBe("0 of 96");
	});

	it("carries the archive on the heading, where the borders are paid for", () => {
		expect(profileCollectionFor(TOTALS).meta).toContain("8 MB archive");
	});

	it("counts no gates, because the record states depth and swatches", () => {
		const labels = profileCollectionFor(TOTALS).counts.map(
			(count) => count.label
		);

		expect(labels).not.toContain("gates");
		expect(labels).not.toContain("swatches");
	});

	it("says the polls themselves stay private", () => {
		expect(profileCollectionFor(TOTALS).note).toContain("private");
	});
});

const RECORD: ProfileRecord = {
	deepestGate: 9,
	gatesTotal: 13,
	clearedGates: [1, 2, 3, 4, 6],
	runsFinished: 24,
	runsWon: 2,
	bestStreak: 21,
	bestCategory: "css",
	bestRun: null,
	seats: [{ category: "css", streak: 21 }],
	recentRuns: [],
};

const CINNABAR_RUN: RunHistoryEntry = {
	runId: 42,
	endedAt: new Date(TEST_DATES.christmas),
	gatesCleared: 9,
	swatchGates: [1, 2],
	coverage: 0.11,
	band: "danger",
	won: false,
	heldBy: "Cinnabar",
};

describe("profileHeroFor", () => {
	const ARCHIVED = 8 * 1024 * 1024;

	it("wears the same face the card wears", () => {
		expect(profileHeroFor(IDENTITY, RECORD, true, ARCHIVED)).toMatchObject(
			profileCardFor(IDENTITY, true)
		);
	});

	it("states a visitor's record as six tiles", () => {
		expect(
			profileHeroFor(IDENTITY, RECORD, false, ARCHIVED).record?.stats
		).toEqual([
			{ label: "deepest gate", value: "9 / 13" },
			{ label: "runs played", value: "24" },
			{ label: "runs won", value: "2" },
			{ label: "best streak", value: "21 in a row" },
			{ label: "best category", value: "CSS" },
			{ label: "archived", value: "8 MB", color: "saffron" },
		]);
	});

	it("dashes a best streak and best category the player has not set", () => {
		const stats =
			profileHeroFor(
				IDENTITY,
				{ ...RECORD, bestStreak: 0, bestCategory: null },
				false,
				0
			).record?.stats ?? [];

		expect(stats.find((stat) => stat.label === "best streak")?.value).toBe("—");
		expect(stats.find((stat) => stat.label === "best category")?.value).toBe(
			"—"
		);
	});

	it("counts the swatches held and draws every gate's swatch", () => {
		const swatches = profileHeroFor(IDENTITY, RECORD, false, ARCHIVED).record
			?.swatches;

		expect(swatches?.value).toBe("5 / 13");
		expect(
			swatches?.fills.filter((fill) => fill.state === "discovered")
		).toHaveLength(5);
	});

	it("draws no record on your own page, which is where you dress", () => {
		expect(profileHeroFor(IDENTITY, RECORD, true, ARCHIVED)).not.toHaveProperty(
			"record"
		);
	});
});

describe("profileBestRunFor", () => {
	it("draws the best run the way the run history draws it", () => {
		expect(
			profileBestRunFor({ ...RECORD, bestRun: CINNABAR_RUN })?.run
		).toEqual(runDetailFor(CINNABAR_RUN));
	});

	it("names the gate the best run reached on the heading", () => {
		expect(profileBestRunFor({ ...RECORD, bestRun: CINNABAR_RUN })?.meta).toBe(
			"reached gate 9"
		);
	});

	it("draws no best run before a run has finished", () => {
		expect(profileBestRunFor(RECORD)).toBeNull();
	});
});

describe("profileSeatsFor", () => {
	it("names each seat they hold and the streak that holds it", () => {
		expect(profileSeatsFor(RECORD)?.seats).toEqual([
			{ category: "CSS", figure: "21 in a row" },
		]);
	});

	it("draws no seats panel for a player who leads nothing", () => {
		expect(profileSeatsFor({ ...RECORD, seats: [] })).toBeNull();
	});
});

describe("profileRunsFor", () => {
	it("counts every finished run, not just the recent few it lists", () => {
		const record: ProfileRecord = { ...RECORD, recentRuns: [CINNABAR_RUN] };

		expect(profileRunsFor(record).count).toBe("24 runs");
	});
});

describe("profileClimbingFor", () => {
	const STANDING: Standing = {
		gate: 6,
		coveragePercent: 68,
		streak: 7,
		storageKb: 4_300,
		build: { configs: [] },
	};

	it("draws the coverage the open run holds against its gate", () => {
		expect(profileClimbingFor(STANDING)?.gate).toMatchObject({
			label: "gate 6",
			coverage: { held: 68 },
		});
	});

	it("draws the same standing the hover card draws", () => {
		expect(profileClimbingFor(STANDING)).toEqual(standingFor(STANDING));
	});

	it("tiles run storage, streak and best category", () => {
		expect(
			profileClimbingFor({ ...STANDING, bestCategory: "css" })?.stats
		).toEqual([
			{ label: "run storage", value: kbLabel(4_300), color: "saffron" },
			{ label: "streak", value: "7" },
			{ label: "best", value: "CSS" },
		]);
	});

	it("draws no climbing panel when no run is open", () => {
		expect(profileClimbingFor(null)).toBeNull();
	});
});

describe("triedOnBorderOf", () => {
	const [stackTrace, mergeConflict] = borders;

	it("names the border being tried on when it is not the one worn", () => {
		expect(triedOnBorderOf(mergeConflict.id, stackTrace.id)).toBe(
			mergeConflict
		);
	});

	it("names a tried-on border when nothing is worn", () => {
		expect(triedOnBorderOf(stackTrace.id, null)).toBe(stackTrace);
	});

	it("names nothing when the tried-on border is already worn", () => {
		expect(triedOnBorderOf(stackTrace.id, stackTrace.id)).toBeUndefined();
	});

	it("names nothing when nothing is tried on", () => {
		expect(triedOnBorderOf(null, stackTrace.id)).toBeUndefined();
	});

	it("names nothing for an id the catalogue does not hold", () => {
		expect(triedOnBorderOf("border-missingno", null)).toBeUndefined();
	});
});

describe("profileCardFor contribution", () => {
	it("states the author's role, polls published and answers drawn beside the polls answered", () => {
		const authorship = { role: "Poll editor", published: 12 };

		expect(profileCardFor({ ...BARE, authorship }, false).contribution).toEqual(
			{ answered: BARE.pollsAnswered, authored: authorship }
		);
	});

	it("states only the polls answered for a player who has published no poll", () => {
		expect(profileCardFor(BARE, false).contribution).toEqual({
			answered: BARE.pollsAnswered,
		});
	});
});
