import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { trackFor } from "~/test/swatchTrack.factory";

import { ProfileHero, type ProfileHeroProps } from "./ProfileHero.ui";

const HERO: ProfileHeroProps = {
	name: "Misty",
	handle: "misty",
	titles: ["Completer"],
	trophies: [
		{ label: "deepest gate", figure: "9", outOf: "/ 13", yours: "you 6" },
		{ label: "swatches", figure: "5", outOf: "/ 13" },
		{ label: "runs won", figure: "2" },
	],
	swatches: trackFor([0, 1, 2, 3, 5]),
	note: "A swatch is a gate taken at 100% coverage.",
};

describe("ProfileHero", () => {
	it("names the player as the page's heading", () => {
		render(<ProfileHero {...HERO} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Misty" })
		).toBeVisible();
	});

	it("states each trophy with its label and figure", () => {
		render(<ProfileHero {...HERO} />);

		expect(screen.getByText("deepest gate")).toBeVisible();
		expect(screen.getByText("9")).toBeVisible();
		expect(screen.getByText("runs won")).toBeVisible();
		expect(screen.getByText("2")).toBeVisible();
	});

	it("states a visitor's own figure under the trophy it compares", () => {
		render(<ProfileHero {...HERO} />);

		expect(screen.getByText("you 6")).toBeVisible();
	});

	it("draws the swatch track with how many are minted", () => {
		render(<ProfileHero {...HERO} />);

		expect(
			screen.getByRole("img", { name: "5 of 13 swatches discovered" })
		).toBeVisible();
	});

	it("seats the owner's press in the corner", () => {
		render(<ProfileHero {...HERO} trailing={<button>edit profile</button>} />);

		expect(screen.getByRole("button", { name: "edit profile" })).toBeVisible();
	});
});
