import { describe, expect, it } from "vitest";

import {
	type PlayerRun,
	playerCardFor,
	standingFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import { baseGateLadderAt } from "~/modules/run/gate/domain/gate.model";

const RUN: PlayerRun = {
	gate: 3,
	coveragePercent: 58,
	streak: 4,
	storageKb: 896,
	bestCategory: "css",
	build: {
		configs: [
			{ id: "eslint", label: "ESLint", slots: 2, level: 1 },
			{ id: "prettier", label: "Prettier", slots: 1 },
		],
	},
};

describe("standingFor", () => {
	it("names the gate, its number and its swatch apart", () => {
		expect(standingFor(RUN).gate).toMatchObject({
			name: "Thunder",
			label: "gate 3",
			swatch: { gate: 3 },
		});
	});

	it("draws the coverage against the gate's unaudited ladder", () => {
		expect(standingFor(RUN).gate.coverage).toEqual({
			...baseGateLadderAt(3),
			held: 58,
		});
	});

	it("counts the weight left free in the build", () => {
		const standing = standingFor(RUN);

		expect(standing.weight).toMatch(/^3 of \d+ weight$/);
		expect(standing.freeSlots).toBeGreaterThanOrEqual(0);
	});

	it("never counts free weight below zero for a build over its space", () => {
		const packed = standingFor({
			...RUN,
			build: {
				configs: [{ id: "webpack", label: "Webpack", slots: 40 }],
			},
		});

		expect(packed.freeSlots).toBe(0);
	});

	it("tiles run storage, streak and best category by name", () => {
		expect(standingFor(RUN).stats).toEqual([
			{ label: "run storage", value: "896 KB" },
			{ label: "streak", value: "4" },
			{ label: "best", value: "CSS" },
		]);
	});
});

describe("playerCardFor", () => {
	it("draws a player with no open run as a face and a name only, linking nothing", () => {
		expect(playerCardFor({ userId: "misty", displayName: "misty" })).toEqual({
			name: "misty",
		});
	});

	it("carries the worn title, the photo and the border through", () => {
		expect(
			playerCardFor({
				userId: "misty",
				displayName: "misty",
				photoUrl: "/editors/misty.png",
				borderUrl: "/borders/border-css-cerulean.svg",
				title: "Ship It",
			})
		).toMatchObject({
			photoUrl: "/editors/misty.png",
			borderUrl: "/borders/border-css-cerulean.svg",
			title: "Ship It",
		});
	});

	it("adds the standing when the player has a run open", () => {
		expect(
			playerCardFor({ userId: "misty", displayName: "misty", run: RUN })
				.standing
		).toEqual(standingFor(RUN));
	});
});
