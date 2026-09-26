import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { COPY, ProfileCard } from "./ProfileCard.ui";

const NAME = "marciano_schildmeijer";
const BORDER = "/borders/border-ts-lavender.svg";
const PHOTO = "/editors/misty.png";

describe("ProfileCard", () => {
	it("names the player", () => {
		render(<ProfileCard name={NAME} />);

		expect(screen.getByText(NAME)).toBeInTheDocument();
	});

	it("states that no title is worn, rather than leaving the line empty", () => {
		render(<ProfileCard name={NAME} />);

		expect(screen.getByText(COPY.noTitle)).toBeInTheDocument();
	});

	it("draws every worn title, because a player may wear more than one", () => {
		render(<ProfileCard name={NAME} titles={["Summit", "First Ascent"]} />);

		expect(screen.getByText("Summit")).toBeInTheDocument();
		expect(screen.getByText("First Ascent")).toBeInTheDocument();
		expect(screen.queryByText(COPY.noTitle)).not.toBeInTheDocument();
	});

	it("draws the worn titles in the order they were equipped", () => {
		render(<ProfileCard name={NAME} titles={["Summit", "First Ascent"]} />);

		const chips = screen.getAllByText(/Summit|First Ascent/);

		expect(chips.map((chip) => chip.textContent)).toEqual([
			"Summit",
			"First Ascent",
		]);
	});

	it("wears the equipped border over the face", () => {
		const { container } = render(
			<ProfileCard name={NAME} borderUrl={BORDER} />
		);

		expect(container.querySelector(`img[src="${BORDER}"]`)).toBeInTheDocument();
	});

	it("falls back to initials when the player has no photo", () => {
		render(<ProfileCard name="Misty" />);

		expect(screen.getByTitle("Misty")).toHaveTextContent("MI");
	});

	it("draws the photo when there is one", () => {
		const { container } = render(<ProfileCard name="Misty" photoUrl={PHOTO} />);

		expect(container.querySelector(`img[src="${PHOTO}"]`)).toBeInTheDocument();
	});

	it("stands as a page header, linking nowhere", () => {
		const { container } = render(<ProfileCard name={NAME} />);

		expect(container.querySelector("section")).toBeInTheDocument();
		expect(container.querySelector("a")).toBeNull();
	});

	it("becomes one link to the profile when it is a trigger somewhere else", () => {
		const { container } = render(
			<ProfileCard name={NAME} href="/profile/red" />
		);

		const links = container.querySelectorAll("a");

		expect(links).toHaveLength(1);
		expect(links[0]).toHaveAttribute("href", "/profile/red");
	});

	it("keeps the handle off GitHub while the card is itself a link, so no anchor nests", () => {
		const { container } = render(
			<ProfileCard name={NAME} handle="misty" href="/profile/red" />
		);

		expect(container.querySelectorAll("a")).toHaveLength(1);
		expect(screen.getByText("@misty")).toBeInTheDocument();
	});

	it("sends the handle to GitHub when the card is not a link", () => {
		render(<ProfileCard name={NAME} handle="misty" />);

		expect(screen.getByText("@misty").closest("a")).toHaveAttribute(
			"href",
			"https://github.com/misty"
		);
	});

	it("carries the press it was handed", () => {
		render(
			<ProfileCard name={NAME} trailing={<button>edit profile</button>} />
		);

		expect(
			screen.getByRole("button", { name: "edit profile" })
		).toBeInTheDocument();
	});
});
