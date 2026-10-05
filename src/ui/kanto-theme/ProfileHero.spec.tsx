import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProfileHero, type ProfileHeroProps } from "./ProfileHero.ui";

const HERO: ProfileHeroProps = {
	name: "Misty",
	handle: "misty",
	titles: ["Completer"],
	record: {
		stats: [
			{ label: "deepest gate", value: "9 / 13" },
			{ label: "runs played", value: "24" },
			{ label: "archived", value: "8 MB", color: "saffron" },
		],
	},
	swatches: {
		label: "swatches",
		value: "5 / 13",
		fills: [{ state: "undiscovered" }],
	},
};

describe("ProfileHero", () => {
	it("names the player as the page's heading", () => {
		render(<ProfileHero {...HERO} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Misty" })
		).toBeVisible();
	});

	it("states the record as tiles, each a label over its figure", () => {
		render(<ProfileHero {...HERO} />);

		expect(screen.getByText("deepest gate")).toBeVisible();
		expect(screen.getByText("9 / 13")).toBeVisible();
		expect(screen.getByText("8 MB")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("closes the record with the swatches held and their track", () => {
		render(<ProfileHero {...HERO} />);

		expect(screen.getByText("swatches")).toBeVisible();
		expect(screen.getByText("5 / 13")).toBeVisible();
	});

	it("rings the hero and labels it a preview while the look is unsaved", () => {
		const { container } = render(
			<ProfileHero {...HERO} preview="preview · not saved" />
		);

		expect(screen.getByText("preview · not saved")).toBeVisible();
		expect(container.firstElementChild).toHaveClass("ring-saffron");
	});

	it("draws no preview label for a saved look", () => {
		const { container } = render(<ProfileHero {...HERO} />);

		expect(screen.queryByText(/not saved/)).not.toBeInTheDocument();
		expect(container.firstElementChild).not.toHaveClass("ring-saffron");
	});

	it("draws no record when it is handed none", () => {
		render(<ProfileHero {...HERO} record={undefined} />);

		expect(screen.queryByText("deepest gate")).not.toBeInTheDocument();
	});
});
