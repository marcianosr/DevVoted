import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { HallOfFame, type HallOfFameHolder } from "./HallOfFame.ui";

const CAPTION = "the longest run of correct JavaScript answers";

const SABRINA: HallOfFameHolder = {
	handle: "@sabrina",
	githubLogin: "sabrina",
	title: "JavaScript Maintainer",
	figure: "17 in a row",
	photoUrl: "/editors/sabrina.png",
};

describe("HallOfFame", () => {
	it("names the record the category holds it for", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.getByText(CAPTION)).toBeVisible();
		expect(screen.getByText("Record holder of")).toBeVisible();
	});

	it("credits the holder with the title the record carries", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.getByText("JavaScript Maintainer")).toBeVisible();
		expect(screen.getByText("17 in a row")).toBeVisible();
	});

	it("states the figure rather than offering it as a press", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("links the holder to their account without doubling the handle marker", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.getByRole("link", { name: "@sabrina" })).toHaveAttribute(
			"href",
			"https://github.com/sabrina"
		);
	});

	it("states a holder with no GitHub account rather than linking a guess", () => {
		render(
			<HallOfFame
				caption={CAPTION}
				holder={{ ...SABRINA, githubLogin: undefined, handle: "Sabrina" }}
			/>
		);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByText("Sabrina")).toBeVisible();
	});

	it("opens the holder's account in its own tab", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.getByRole("link", { name: "@sabrina" })).toHaveAttribute(
			"target",
			"_blank"
		);
	});

	it("invites a claim when no record stands", () => {
		render(<HallOfFame caption={CAPTION} yourBest="your best 2" />);

		expect(screen.getByText("— unclaimed —")).toBeVisible();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("draws no avatar for a record nobody holds", () => {
		const { container } = render(<HallOfFame caption={CAPTION} />);

		expect(container.querySelector("img")).toBeNull();
	});

	it("rings the avatar when the record is your own", () => {
		render(<HallOfFame caption={CAPTION} holder={{ ...SABRINA, you: true }} />);

		expect(screen.getByTitle("you")).toBeVisible();
	});

	it("pushes your own figure to the far end of the row", () => {
		render(
			<HallOfFame caption={CAPTION} holder={SABRINA} yourBest="your best 4" />
		);

		expect(screen.getByText("your best 4").parentElement).toHaveClass(
			"ml-auto"
		);
	});

	it("says nothing about you when there is nothing to say", () => {
		render(<HallOfFame caption={CAPTION} holder={SABRINA} />);

		expect(screen.queryByText(/your best/)).toBeNull();
	});

	it("rules itself off the region above, so the line reaches the panel edges", () => {
		const { container } = render(
			<HallOfFame caption={CAPTION} holder={SABRINA} />
		);

		expect(container.firstChild).toHaveClass("border-t", "border-theme-faint");
		expect(container.firstChild).toHaveClass("px-4");
	});
});
