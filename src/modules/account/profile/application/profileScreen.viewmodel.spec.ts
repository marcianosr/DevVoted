import { describe, expect, it } from "vitest";

import {
	archiveLabelOf,
	isOwnerTabId,
	isProfileTabId,
	OWNER_TAB_IDS,
	PROFILE_TABS,
	profileCardFor,
	profileThemeOf,
	profileTotalsFor,
	type ProfileIdentity,
} from "~/modules/account/profile/application/profileScreen.viewmodel";
import { DEX_TABS } from "~/modules/collection/dex/application/dexScreen.viewmodel";

const IDENTITY: ProfileIdentity = {
	displayName: "marciano_schildmeijer",
	githubUsername: "marciano",
	photoUrl: "/editors/misty.png",
	borderUrl: "/borders/border-ts-lavender.svg",
	wornTitles: ["Git Maintainer", "Summit"],
};

const BARE: ProfileIdentity = {
	displayName: "Brock",
	githubUsername: null,
	photoUrl: null,
	borderUrl: null,
	wornTitles: [],
};

describe("PROFILE_TABS", () => {
	it("carries every Dex tab, so the collection is whole", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		for (const tab of DEX_TABS) expect(ids).toContain(tab.id);
	});

	it("adds the two shelves the owner equips from, behind the collection", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		expect(ids.slice(-2)).toEqual(["borders", "titles"]);
	});

	it("names each tab once, because the id is what the press reads", () => {
		const ids = PROFILE_TABS.map((tab) => tab.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("opens on a Dex tab, not on a shelf", () => {
		expect(isOwnerTabId(PROFILE_TABS[0].id)).toBe(false);
	});
});

describe("isProfileTabId", () => {
	it("admits a Dex tab", () => {
		expect(isProfileTabId("swatches")).toBe(true);
	});

	it("admits a shelf", () => {
		expect(isProfileTabId("titles")).toBe(true);
	});

	it("refuses anything else, so a stale press cannot set a dead tab", () => {
		expect(isProfileTabId("leaderboard")).toBe(false);
	});
});

describe("isOwnerTabId", () => {
	it("names only the shelves, which a visitor never sees", () => {
		expect(OWNER_TAB_IDS.every(isOwnerTabId)).toBe(true);
		expect(isOwnerTabId("polls")).toBe(false);
	});
});

describe("profileThemeOf", () => {
	it("wears the colour of the tab being read", () => {
		expect(profileThemeOf("swatches")).toBe("lavender");
	});

	it("gives each shelf a colour of its own", () => {
		expect(profileThemeOf("borders")).not.toBe(profileThemeOf("titles"));
	});

	it("falls back to the first tab's colour for an id nothing claims", () => {
		expect(profileThemeOf("nowhere")).toBe(PROFILE_TABS[0].color);
	});
});

describe("profileCardFor", () => {
	it("names the player and every title they wear", () => {
		expect(profileCardFor(IDENTITY, false)).toMatchObject({
			name: "marciano_schildmeijer",
			titles: ["Git Maintainer", "Summit"],
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
});

describe("profileTotalsFor", () => {
	const TOTALS = {
		pollsSeen: 9,
		pollsTotal: 96,
		configsHeld: 4,
		configsTotal: 30,
		gatesCleared: 3,
		gatesTotal: 13,
		archivedStorage: 8_388_608,
	};

	it("states each collection as held of total", () => {
		expect(profileTotalsFor(TOTALS)).toEqual([
			"9 of 96 polls",
			"4 of 30 configs",
			"3 of 13 gates",
			"8 MB archive",
		]);
	});

	it("states a brand new account as zero rather than leaving it blank", () => {
		const fresh = profileTotalsFor({
			...TOTALS,
			pollsSeen: 0,
			configsHeld: 0,
			gatesCleared: 0,
			archivedStorage: 0,
		});

		expect(fresh[0]).toBe("0 of 96 polls");
		expect(fresh[2]).toBe("0 of 13 gates");
	});
});

describe("archiveLabelOf", () => {
	it("names the unit, because a bare number reads as a score", () => {
		expect(archiveLabelOf(8_388_608)).toBe("8 MB archive");
	});

	it("reads zero as bytes rather than as nothing at all", () => {
		expect(archiveLabelOf(0)).toContain("archive");
	});
});
