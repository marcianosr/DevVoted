import { describe, expect, it } from "vitest";

import {
	discloseAll,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

const OFFERS = [".js", "Code Coverage", ".ts"];
const OPEN_BY_DEFAULT = true;
const SHUT_BY_DEFAULT = false;

describe("disclosedIn", () => {
	it("opens every card of a panel whose cards arrive open", () => {
		expect(disclosedIn(OFFERS, new Set(), OPEN_BY_DEFAULT)).toEqual(
			new Set(OFFERS)
		);
	});

	it("opens no card of a panel whose cards arrive shut", () => {
		expect(disclosedIn(OFFERS, new Set(), SHUT_BY_DEFAULT)).toEqual(new Set());
	});

	it("shuts the one card flipped away from an open default", () => {
		const open = disclosedIn(OFFERS, new Set([".ts"]), OPEN_BY_DEFAULT);

		expect(open.has(".ts")).toBe(false);
		expect(open.has("Code Coverage")).toBe(true);
	});

	it("opens the one card flipped away from a shut default", () => {
		const open = disclosedIn(OFFERS, new Set([".ts"]), SHUT_BY_DEFAULT);

		expect(open.has(".ts")).toBe(true);
		expect(open.has("Code Coverage")).toBe(false);
	});

	it("draws a card that arrived after the flip at its panel's default", () => {
		const rolled = [...OFFERS, "ESLint"];

		expect(disclosedIn(rolled, new Set([".ts"]), OPEN_BY_DEFAULT)).toContain(
			"ESLint"
		);
	});

	it("forgets a flip on a card the panel no longer lists", () => {
		const installed = OFFERS.filter((name) => name !== ".ts");

		expect(disclosedIn(installed, new Set([".ts"]), OPEN_BY_DEFAULT)).toEqual(
			new Set(installed)
		);
	});
});

describe("toggleDisclosure", () => {
	it("records a card flipped away from its default", () => {
		expect(toggleDisclosure(new Set(), ".ts")).toEqual(new Set([".ts"]));
	});

	it("drops a card flipped back to its default", () => {
		expect(toggleDisclosure(new Set([".ts"]), ".ts")).toEqual(new Set());
	});

	it("leaves the cards it was not asked about alone", () => {
		expect(toggleDisclosure(new Set([".js"]), ".ts")).toEqual(
			new Set([".js", ".ts"])
		);
	});

	it("returns a new set rather than mutating the one it was given", () => {
		const flipped = new Set([".js"]);

		expect(toggleDisclosure(flipped, ".ts")).not.toBe(flipped);
		expect(flipped).toEqual(new Set([".js"]));
	});
});

describe("discloseAll", () => {
	it("flips nothing to open a panel that already opens by default", () => {
		expect(discloseAll(OFFERS, true, OPEN_BY_DEFAULT)).toEqual(new Set());
	});

	it("flips every card to shut a panel that opens by default", () => {
		expect(discloseAll(OFFERS, false, OPEN_BY_DEFAULT)).toEqual(
			new Set(OFFERS)
		);
	});

	it("flips every card to open a panel that arrives shut", () => {
		expect(discloseAll(OFFERS, true, SHUT_BY_DEFAULT)).toEqual(new Set(OFFERS));
	});

	it("leaves a card the panel stops listing out of the flips", () => {
		const flips = discloseAll([".js"], false, OPEN_BY_DEFAULT);

		expect(disclosedIn([".js", ".ts"], flips, OPEN_BY_DEFAULT)).toEqual(
			new Set([".ts"])
		);
	});
});
