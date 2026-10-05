import { describe, expect, it } from "vitest";

import {
	ADVERTISEMENTS,
	advertisementFor,
	advertisementPropsFor,
	bordersForSaleTo,
	isBannerPage,
	isDismissibleVariant,
	variantAt,
} from "~/modules/account/profile/application/advertisement.viewmodel";
import {
	borders,
	CHAMPION_BORDER_ID,
	findBorderById,
} from "~/modules/account/profile/domain/border.model";
import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import { SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { kbLabel } from "~/shared/lib/storage";

const PLAYER = { isAdmin: false, ownedBorderIds: [] };
const ADMIN = { isAdmin: true, ownedBorderIds: [] };
const ROLL_SUGGEST = { kind: 0.1, border: 0 };
const ROLL_BORDER = { kind: 0.9, border: 0 };
const ALL_BORDER_IDS = borders.map((border) => border.id);
const MISTY = { name: "Misty", photoUrl: "/faces/misty.png" };
const MISTY_PROFILE = "/profile/misty";

describe("bordersForSaleTo", () => {
	it("leaves out the Champion border, which only a won run grants", () => {
		const forSale = bordersForSaleTo([]).map((border) => border.id);

		expect(forSale).not.toContain(CHAMPION_BORDER_ID);
	});

	it("leaves out every border the player already owns", () => {
		const forSale = bordersForSaleTo(["border-react", "border-ruby"]).map(
			(border) => border.id
		);

		expect(forSale).not.toContain("border-react");
		expect(forSale).not.toContain("border-ruby");
		expect(forSale).toContain("border-css");
	});
});

describe("advertisementFor", () => {
	it("advertises suggesting a poll when the roll lands low", () => {
		expect(advertisementFor(PLAYER, ROLL_SUGGEST)).toEqual({
			kind: "suggest",
		});
	});

	it("advertises a border when the roll lands high", () => {
		expect(advertisementFor(PLAYER, ROLL_BORDER)?.kind).toBe("border");
	});

	it("picks the border by its roll across the borders for sale", () => {
		const forSale = bordersForSaleTo([]);
		const last = advertisementFor(PLAYER, { kind: 0.9, border: 0.9999 });

		expect(last).toEqual({ kind: "border", border: forSale.at(-1) });
	});

	it("never advertises suggesting a poll to an admin, whose polls pay nothing", () => {
		expect(advertisementFor(ADMIN, ROLL_SUGGEST)?.kind).toBe("border");
	});

	it("advertises suggesting a poll once every border is owned", () => {
		const collector = { isAdmin: false, ownedBorderIds: ALL_BORDER_IDS };

		expect(advertisementFor(collector, ROLL_BORDER)).toEqual({
			kind: "suggest",
		});
	});

	it("advertises nothing to an admin who owns every border", () => {
		const collector = { isAdmin: true, ownedBorderIds: ALL_BORDER_IDS };

		expect(advertisementFor(collector, ROLL_BORDER)).toBeUndefined();
	});
});

describe("ADVERTISEMENTS", () => {
	it("lists each kind of advertisement once", () => {
		expect(ADVERTISEMENTS.map((entry) => entry.kind)).toEqual([
			"suggest",
			"border",
		]);
	});

	it("weighs poll editors and borders the same", () => {
		const [suggest, border] = ADVERTISEMENTS;

		expect(suggest.weight).toBe(border.weight);
	});
});

describe("advertisementFor by weight", () => {
	it("advertises poll editors just below the halfway roll", () => {
		expect(advertisementFor(PLAYER, { kind: 0.49, border: 0 })?.kind).toBe(
			"suggest"
		);
	});

	it("advertises a border just above the halfway roll", () => {
		expect(advertisementFor(PLAYER, { kind: 0.51, border: 0 })?.kind).toBe(
			"border"
		);
	});
});

describe("isBannerPage", () => {
	it.each(["/", "/polls", "/polls/42", "/admin"])(
		"runs the banner along %s, which carries no advertisement card",
		(pathname) => {
			expect(isBannerPage(pathname)).toBe(true);
		}
	);

	it.each([
		"/run",
		"/run/poll",
		"/run/new",
		"/run/community",
		"/profile/misty",
	])("leaves the banner off %s, which carries its own card", (pathname) => {
		expect(isBannerPage(pathname)).toBe(false);
	});

	it("leaves the banner off the suggest form, which is where it leads", () => {
		expect(isBannerPage(SUGGEST_POLL_PATH)).toBe(false);
	});

	it.each(["/login", "/sign-up"])(
		"leaves the banner off %s, before anyone is signed in",
		(pathname) => {
			expect(isBannerPage(pathname)).toBe(false);
		}
	);
});

describe("variantAt", () => {
	it("draws the poll screen's advertisement as a strip nobody can close", () => {
		expect(variantAt("poll")).toBe("strip");
		expect(isDismissibleVariant("strip")).toBe(false);
	});

	it("draws the banner placement as a closable banner", () => {
		expect(variantAt("banner")).toBe("banner");
		expect(isDismissibleVariant("banner")).toBe(true);
	});

	it.each(["hub", "newRun", "profile", "community"] as const)(
		"draws %s as a closable card",
		(placement) => {
			expect(variantAt(placement)).toBe("card");
			expect(isDismissibleVariant("card")).toBe(true);
		}
	);
});

describe("advertisementPropsFor", () => {
	it("asks for poll editors and states the archive reward", () => {
		const props = advertisementPropsFor(
			{ kind: "suggest" },
			MISTY,
			MISTY_PROFILE
		);

		expect(props).toEqual({
			title: "Looking for poll editors",
			text: `Approved polls earn ${kbLabel(APPROVED_POLL_ARCHIVE_KB)} archived storage!`,
			icon: { kind: "cookie" },
			cta: { label: "Suggest a poll", href: SUGGEST_POLL_PATH },
		});
	});

	it("titles a border by its name and price, and shows it on the player's own face", () => {
		const react = findBorderById("border-react");
		if (react === undefined) throw new Error("border-react is missing");

		const props = advertisementPropsFor(
			{ kind: "border", border: react },
			MISTY,
			MISTY_PROFILE
		);

		expect(props).toEqual({
			title: "React Initiate · 256 KB",
			text: react.description,
			icon: {
				kind: "face",
				name: MISTY.name,
				photoUrl: MISTY.photoUrl,
				borderUrl: react.image,
			},
			cta: { label: "Open market", href: `${MISTY_PROFILE}?tab=borders` },
		});
	});
});
