import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CommunityStandout } from "~/modules/run/community/application/community.service";

import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";

const standout = (
	title: string,
	value: string,
	winner: { id: string; displayName: string; you?: boolean }
): CommunityStandout => ({
	voter: { ...winner, you: winner.you ?? false },
	title,
	value,
});

const YOURS = standout("fastest answer", "9s", {
	id: "red",
	displayName: "Red",
	you: true,
});
const THEIRS = standout("most CSS polls", "3", {
	id: "brock",
	displayName: "Brock Boulder",
});
const DEEPEST: CommunityStandout = {
	...standout("deepest gate", "Soul", { id: "misty", displayName: "Misty" }),
	swatch: { theme: "soul", finish: "flat" },
};

describe("StandoutsPanel", () => {
	it("lists each award by title and value", () => {
		render(<StandoutsPanel standouts={[YOURS, THEIRS]} />);

		expect(screen.getByText("fastest answer")).toBeInTheDocument();
		expect(screen.getByText("9s")).toBeInTheDocument();
		expect(screen.getByText("most CSS polls")).toBeInTheDocument();
	});

	it("names the winner in the avatar's tooltip, not on the row", () => {
		render(<StandoutsPanel standouts={[THEIRS]} />);

		expect(
			screen
				.getAllByText("Brock Boulder")
				.every((node) => node.getAttribute("role") === "tooltip")
		).toBe(true);
	});

	it("wears the gate's badge beside its name", () => {
		render(<StandoutsPanel standouts={[DEEPEST]} />);

		expect(screen.getByText("Soul")).toBeInTheDocument();
		expect(
			document.querySelector('[data-swatch-theme="soul"]')
		).toBeInTheDocument();
	});

	it("shows no badge on an award that does not name a gate", () => {
		render(<StandoutsPanel standouts={[YOURS]} />);

		expect(
			document.querySelector("[data-swatch-theme]")
		).not.toBeInTheDocument();
	});

	it("counts your haul beside the heading", () => {
		render(<StandoutsPanel standouts={[YOURS, THEIRS, DEEPEST]} />);

		expect(screen.getByText("you took 1 of 3")).toBeInTheDocument();
	});

	it("says nothing about your haul when you took none", () => {
		render(<StandoutsPanel standouts={[THEIRS, DEEPEST]} />);

		expect(screen.queryByText(/you took/)).not.toBeInTheDocument();
	});

	it("calls a clean sweep what it is", () => {
		render(<StandoutsPanel standouts={[YOURS]} />);

		expect(screen.getByText("you took it")).toBeInTheDocument();
	});

	it("renders nothing at all on a day with no awards", () => {
		const { container } = render(<StandoutsPanel standouts={[]} />);

		expect(container).toBeEmptyDOMElement();
	});
});
