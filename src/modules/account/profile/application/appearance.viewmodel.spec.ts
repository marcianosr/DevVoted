import { describe, expect, it } from "vitest";

import {
	appearanceFor,
	DEFAULT_BORDER_NAME,
	lookedIdentityOf,
	type AppearanceInput,
} from "~/modules/account/profile/application/appearance.viewmodel";
import type { ProfileIdentity } from "~/modules/account/profile/domain/profile.model";
import {
	borders,
	findBorderById,
} from "~/modules/account/profile/domain/border.model";
import { NO_AUTHORSHIP } from "~/modules/account/profile/domain/authorship.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const STACK_TRACE = "border-00b9a62e";
const MERGE_CONFLICT = "border-0a006140";
const NEWBIE = "title-rank-poll-newbie";
const TESTER = "title-legacy-tester";
const CSS_CARRIER = "title-answered-css";
const BIKESHEDDER = "title-it-compiles";
const CERULEAN = "swatch-cerulean";

const IDENTITY: ProfileIdentity = {
	displayName: "misty_cerulean",
	githubUsername: null,
	photoUrl: null,
	borderUrl: null,
	wornTitles: [],
	pollsAnswered: 34,
	authorship: NO_AUTHORSHIP,
};

const INPUT: AppearanceInput = {
	identity: IDENTITY,
	look: { borderId: STACK_TRACE, titleIds: [TESTER], swatchId: CERULEAN },
	tryingOnId: null,
	ownedBorderIds: [STACK_TRACE],
	ownedTitleIds: [NEWBIE, TESTER, CSS_CARRIER],
	ownedSwatchIds: [CERULEAN],
};

const imageOf = (borderId: string) => findBorderById(borderId)?.image;

describe("lookedIdentityOf", () => {
	it("wears the drafted border and titles, not the saved ones", () => {
		const looked = lookedIdentityOf(IDENTITY, INPUT.look, null);

		expect(looked.borderUrl).toBe(imageOf(STACK_TRACE));
		expect(looked.wornTitles).toEqual(["Legacy Tester"]);
	});

	it("shows a border being tried on over the drafted one", () => {
		expect(
			lookedIdentityOf(IDENTITY, INPUT.look, MERGE_CONFLICT).borderUrl
		).toBe(imageOf(MERGE_CONFLICT));
	});
});

describe("appearanceFor", () => {
	it("offers every swatch, wearing the drafted one and withholding the unearned", () => {
		const { swatches } = appearanceFor(INPUT);
		const stateOf = (id: string) =>
			swatches.find((swatch) => swatch.id === id)?.state;

		expect(swatches).toHaveLength(ALL_SWATCHES.length);
		expect(stateOf(CERULEAN)).toBe("worn");
		expect(stateOf("swatch-pallet")).toBe("owned");
		expect(stateOf("swatch-viridian")).toBe("locked");
	});

	it("wears the pallet swatch when the draft wears none", () => {
		const { swatches } = appearanceFor({
			...INPUT,
			look: { ...INPUT.look, swatchId: null },
		});

		expect(swatches.find((swatch) => swatch.state === "worn")?.id).toBe(
			"swatch-pallet"
		);
	});

	it("offers the default border first, then only the borders the player owns", () => {
		const { borders: picks } = appearanceFor(INPUT);

		expect(picks.map((pick) => pick.name)).toEqual([
			DEFAULT_BORDER_NAME,
			"Stack Trace",
		]);
		expect(picks.map((pick) => pick.picked)).toEqual([false, true]);
	});

	it("marks the default border picked when the look wears none", () => {
		const [defaultPick] = appearanceFor({
			...INPUT,
			look: { ...INPUT.look, borderId: null },
		}).borders;

		expect(defaultPick.picked).toBe(true);
	});

	it("lists worn titles first by their slot, then the rest the player owns", () => {
		const { titles } = appearanceFor({
			...INPUT,
			look: { ...INPUT.look, titleIds: [CSS_CARRIER, TESTER] },
		});

		expect(titles.map((title) => [title.id, title.wornAt])).toEqual([
			[CSS_CARRIER, 1],
			[TESTER, 2],
			[NEWBIE, null],
		]);
	});

	it("blocks every unworn title once the card is full", () => {
		const { titles } = appearanceFor({
			...INPUT,
			ownedTitleIds: [...INPUT.ownedTitleIds, BIKESHEDDER],
			look: { ...INPUT.look, titleIds: [NEWBIE, TESTER, CSS_CARRIER] },
		});

		expect(
			titles.filter((title) => title.blocked).map((title) => title.id)
		).toEqual([BIKESHEDDER]);
	});

	it("names the border being tried on", () => {
		expect(
			appearanceFor({ ...INPUT, tryingOnId: MERGE_CONFLICT }).tryingOn
		).toBe("Merge Conflict");
	});

	it("tallies owned borders against the whole roster", () => {
		expect(appearanceFor(INPUT).borderTally).toEqual({
			held: 1,
			total: borders.length,
		});
	});

	it("never tallies a retired border id as owned", () => {
		expect(
			appearanceFor({
				...INPUT,
				ownedBorderIds: [STACK_TRACE, "border-retired"],
			}).borderTally.held
		).toBe(1);
	});

	it("tallies titles by the collection's rule, so a retired title is never held", () => {
		const tally = appearanceFor({
			...INPUT,
			ownedTitleIds: [NEWBIE, "title-retired-long-ago"],
		}).titleTally;

		expect(tally.held).toBe(1);
		expect(tally.held).toBeLessThanOrEqual(tally.total);
	});
});
