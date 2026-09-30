import { describe, expect, it } from "vitest";

import {
	isOwnerTabId,
	isProfileTabId,
	OWNER_TAB_IDS,
	PROFILE_TABS,
	profileCardFor,
	profileClimbingFor,
	profileCollectionFor,
	profileRecordFor,
	triedOnBorderOf,
	type ProfileIdentity,
	type ProfileRecord,
	type ProfileStanding,
	type ProfileTotals,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { NO_AUTHORSHIP } from "~/modules/account/profile/domain/authorship.model";
import { borders } from "~/modules/account/profile/domain/border.model";
import { DEX_TABS } from "~/modules/collection/dex/application/dexScreen.viewmodel";
import { standingFor } from "~/modules/run/community/application/playerCard.viewmodel";
import { kbLabel } from "~/shared/lib/storage";

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

	it("states the rank the answer count has reached", () => {
		expect(profileCardFor(IDENTITY, false).rank).toBe("'Long Polling'");
	});

	it("puts an account that has answered nothing on the first rung", () => {
		expect(profileCardFor(BARE, false).rank).toBe("Poll Newbie");
	});
});

describe("profileCollectionFor", () => {
	const TOTALS: ProfileTotals = {
		pollsSeen: 9,
		pollsTotal: 96,
		configsHeld: 4,
		configsTotal: 30,
		titlesOwned: 2,
		titlesTotal: 16,
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
			pollsSeen: 0,
			configsHeld: 0,
			titlesOwned: 0,
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

describe("profileRecordFor", () => {
	const RECORD: ProfileRecord = {
		deepestGate: 9,
		gatesTotal: 13,
		clearedGates: [1, 2, 3, 4, 6],
		runsFinished: 24,
		seats: [{ category: "css", streak: 21 }],
		recentRuns: [],
	};

	it("leads with how deep they reached and how many gates they swept", () => {
		expect(profileRecordFor(RECORD).figures).toMatchObject([
			{ label: "deepest gate", figure: "9 of 13" },
			{ label: "swatches", figure: "5 of 13" },
			{ label: "runs finished", figure: "24" },
		]);
	});

	it("states the viewer's own figure beside the two headline ones", () => {
		const yours: ProfileRecord = {
			...RECORD,
			deepestGate: 6,
			clearedGates: [1, 2, 3],
		};

		const [deepest, swatches] = profileRecordFor(RECORD, yours).figures;

		expect(deepest.yours).toBe("you 6 of 13");
		expect(swatches.yours).toBe("you 3 of 13");
	});

	it("withholds the comparison when there is no viewer to compare against", () => {
		for (const figure of profileRecordFor(RECORD).figures)
			expect(figure).not.toHaveProperty("yours");
	});

	it("leaves the run count uncompared, because it rewards playing, not climbing", () => {
		const [, , runs] = profileRecordFor(RECORD, RECORD).figures;

		expect(runs).not.toHaveProperty("yours");
	});

	it("draws a swatch for every gate, filling only the ones they swept", () => {
		const { swatches } = profileRecordFor(RECORD);

		expect(swatches).toHaveLength(13);
		expect(swatches.filter((fill) => fill.state === "discovered")).toHaveLength(
			5
		);
	});

	it("names each seat they hold and the streak that holds it", () => {
		expect(profileRecordFor(RECORD).seats).toEqual([
			{ category: "CSS", figure: "21 in a row" },
		]);
	});

	it("holds no seats without inventing one", () => {
		expect(profileRecordFor({ ...RECORD, seats: [] }).seats).toEqual([]);
	});
});

describe("profileClimbingFor", () => {
	const STANDING: ProfileStanding = {
		gate: 6,
		band: "healthy",
		coveragePercent: 68,
		streak: 7,
		storageKb: 4_300,
		build: { configs: [] },
	};

	it("draws the coverage the open run holds against its gate", () => {
		const { standing } = profileClimbingFor(STANDING);

		expect(standing?.gate).toMatchObject({
			label: "gate 6",
			coverage: { held: 68 },
		});
	});

	it("draws the same standing the hover card draws", () => {
		expect(profileClimbingFor(STANDING).standing).toEqual(
			standingFor(STANDING)
		);
	});

	it("tiles run storage, streak and best category", () => {
		expect(
			profileClimbingFor({ ...STANDING, bestCategory: "css" }).standing?.stats
		).toEqual([
			{ label: "run storage", value: kbLabel(4_300), color: "saffron" },
			{ label: "streak", value: "7" },
			{ label: "best", value: "CSS" },
		]);
	});

	it("draws no standing when no run is open, and says so on the heading", () => {
		const climbing = profileClimbingFor(null);

		expect(climbing.standing).toBeUndefined();
		expect(climbing.meta).toBe("nothing open");
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
	it("states the author's role, polls published and answers drawn", () => {
		const authorship = { role: "Poll editor", published: 12, answers: 1842 };

		expect(profileCardFor({ ...BARE, authorship }, false).contribution).toEqual(
			authorship
		);
	});

	it("states nothing for a player who has published no poll", () => {
		expect(profileCardFor(BARE, false)).not.toHaveProperty("contribution");
	});
});
