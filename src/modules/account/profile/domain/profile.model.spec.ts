import { describe, expect, it } from "vitest";

import {
	profileFaceOf,
	type ProfileSource,
} from "~/modules/account/profile/domain/profile.model";

const RED: ProfileSource = {
	displayName: "red",
	githubUsername: "marciano",
	photoUrl: "/editors/red.png",
	equippedBorderId: null,
	equippedTitleIds: ["title-it-compiles", "title-ship-it"],
	ownedSwatchIds: ["swatch-pallet", "swatch-boulder"],
	equippedSwatchId: null,
	role: "user",
};

const NO_POLLS = { published: 0, answers: 0 };

describe("profileFaceOf", () => {
	it("names the player by their in-game name and keeps the GitHub handle beside it", () => {
		expect(profileFaceOf(RED, NO_POLLS, 0).identity).toMatchObject({
			displayName: "red",
			githubUsername: "marciano",
			photoUrl: "/editors/red.png",
		});
	});

	it("names every worn title in the order the player wears them", () => {
		expect(profileFaceOf(RED, NO_POLLS, 0).identity.wornTitles).toEqual([
			"It Compiles",
			"Ship It",
		]);
	});

	it("draws no border for a retired border id", () => {
		const face = profileFaceOf(
			{ ...RED, equippedBorderId: "border-retired" },
			NO_POLLS,
			0
		);

		expect(face.identity.borderUrl).toBeNull();
	});

	it("carries the polls answered the rank is read from", () => {
		expect(profileFaceOf(RED, NO_POLLS, 120).identity.pollsAnswered).toBe(120);
	});

	it("credits an admin with the polls they published and the answers drawn", () => {
		const face = profileFaceOf(
			{ ...RED, role: "admin" },
			{ published: 3, answers: 40 },
			0
		);

		expect(face.identity.authorship).toEqual({
			role: "Admin",
			published: 3,
			answers: 40,
		});
	});

	it("wears pallet when the player wears no swatch", () => {
		expect(profileFaceOf(RED, NO_POLLS, 0).theme).toBe("pallet");
	});

	it("wears the swatch the player owns and wears", () => {
		const face = profileFaceOf(
			{ ...RED, equippedSwatchId: "swatch-boulder" },
			NO_POLLS,
			0
		);

		expect(face.theme).toBe("boulder");
	});

	it("falls back to pallet for a worn swatch the player does not own", () => {
		const face = profileFaceOf(
			{ ...RED, equippedSwatchId: "swatch-cascade" },
			NO_POLLS,
			0
		);

		expect(face.theme).toBe("pallet");
	});
});
