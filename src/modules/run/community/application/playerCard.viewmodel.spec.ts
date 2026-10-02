import { describe, expect, it } from "vitest";

import { profileFaceOf } from "~/modules/account/profile/domain/profile.model";
import {
	type PlayerCardView,
	playerCardFor,
	playerCardViewFor,
	standingFor,
} from "~/modules/run/community/application/playerCard.viewmodel";
import type { Standing } from "~/modules/run/community/domain/standing.model";
import {
	bandAtLadder,
	baseGateLadderAt,
} from "~/modules/run/gate/domain/gate.model";

const RUN: Standing = {
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
			band: bandAtLadder(58, baseGateLadderAt(3)).id,
		});
	});

	it("counts the weight left free in the build", () => {
		const standing = standingFor(RUN);

		expect(standing.weight).toMatch(/^3 \/ \d+$/);
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
			{ label: "run storage", value: "896 KB", color: "saffron" },
			{ label: "streak", value: "4" },
			{ label: "best", value: "CSS" },
		]);
	});
});

const LOOK = { titles: [], theme: "pallet" } as const satisfies Pick<
	PlayerCardView,
	"titles" | "theme"
>;

describe("playerCardFor", () => {
	it("draws a player with no open run as a face, a name and their look only, linking nothing", () => {
		expect(
			playerCardFor({ ...LOOK, userId: "misty", displayName: "misty" })
		).toEqual({ name: "misty", ...LOOK });
	});

	it("carries the worn titles, the swatch, the photo and the border through", () => {
		expect(
			playerCardFor({
				userId: "misty",
				displayName: "misty",
				photoUrl: "/editors/misty.png",
				borderUrl: "/borders/border-css-cerulean.svg",
				titles: ["Ship It", "Legacy Tester"],
				theme: "cascade",
			})
		).toMatchObject({
			photoUrl: "/editors/misty.png",
			borderUrl: "/borders/border-css-cerulean.svg",
			titles: ["Ship It", "Legacy Tester"],
			theme: "cascade",
		});
	});

	it("adds the standing when the player has a run open", () => {
		expect(
			playerCardFor({
				...LOOK,
				userId: "misty",
				displayName: "misty",
				run: RUN,
			}).standing
		).toEqual(standingFor(RUN));
	});

	it("states a contributing author's role, polls published and answers drawn", () => {
		const authorship = { role: "Poll editor", published: 12, answers: 1842 };

		expect(
			playerCardFor({
				...LOOK,
				userId: "misty",
				displayName: "misty",
				authorship,
			}).contribution
		).toEqual(authorship);
	});

	it("states no contribution for a player who has published no poll", () => {
		expect(
			playerCardFor({
				...LOOK,
				userId: "misty",
				displayName: "misty",
				authorship: { role: "Admin", published: 0, answers: 0 },
			})
		).not.toHaveProperty("contribution");
	});
});

describe("playerCardViewFor", () => {
	const MISTY = {
		displayName: "misty",
		githubUsername: "misty",
		photoUrl: null,
		equippedBorderId: null,
		equippedTitleIds: ["title-ship-it"],
		ownedSwatchIds: [],
		equippedSwatchId: null,
		role: "poll-editor",
	} as const;
	const face = profileFaceOf(MISTY, { published: 12, answers: 1842 }, 40);

	it("draws the card from the same face the profile wears, never the GitHub handle", () => {
		expect(playerCardViewFor("misty-id", face, null)).toEqual({
			userId: "misty-id",
			displayName: "misty",
			titles: ["Ship It"],
			theme: "pallet",
			authorship: { role: "Poll editor", published: 12, answers: 1842 },
		});
	});

	it("carries the open run's standing", () => {
		expect(playerCardViewFor("misty-id", face, RUN).run).toEqual(RUN);
	});
});
