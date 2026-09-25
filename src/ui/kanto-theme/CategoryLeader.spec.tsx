import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CategoryLeader, type CategorySeatLeader } from "./CategoryLeader.ui";

const CATEGORY = "JavaScript";

const SABRINA: CategorySeatLeader = {
	handle: "@sabrina",
	githubLogin: "sabrina",
	figure: "17 in a row",
	photoUrl: "/editors/sabrina.png",
};

describe("CategoryLeader", () => {
	it("names the category the seat is held for", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.getByText(CATEGORY)).toBeVisible();
		expect(screen.getByText("leader")).toBeVisible();
	});

	it("states the run the leader is being credited for", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.getByText("17 in a row")).toBeVisible();
	});

	it("carries no title beside the handle", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.queryByText(/Maintainer|Code Owner/)).toBeNull();
	});

	it("states the figure rather than offering it as a press", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("links the leader to their account without doubling the handle marker", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.getByRole("link", { name: "@sabrina" })).toHaveAttribute(
			"href",
			"https://github.com/sabrina"
		);
	});

	it("states a leader with no GitHub account rather than linking a guess", () => {
		render(
			<CategoryLeader
				category={CATEGORY}
				leader={{ ...SABRINA, githubLogin: undefined, handle: "Sabrina" }}
			/>
		);

		expect(screen.queryByRole("link")).toBeNull();
		expect(screen.getByText("Sabrina")).toBeVisible();
	});

	it("opens the leader's account in its own tab", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.getByRole("link", { name: "@sabrina" })).toHaveAttribute(
			"target",
			"_blank"
		);
	});

	it("pushes the figure to the far end of the line", () => {
		render(<CategoryLeader category={CATEGORY} leader={SABRINA} />);

		expect(screen.getByText("17 in a row").parentElement).toHaveClass(
			"ml-auto"
		);
	});

	it("rings the avatar and greens the figure when the seat is your own", () => {
		render(
			<CategoryLeader category={CATEGORY} leader={{ ...SABRINA, you: true }} />
		);

		expect(screen.getByTitle("you")).toBeVisible();
		expect(screen.getByText("17 in a row")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("says the seat is open when nobody leads the category", () => {
		render(<CategoryLeader category={CATEGORY} claim="3 in a row claims it" />);

		expect(screen.getByText("unranked")).toBeVisible();
		expect(screen.getByText("3 in a row claims it")).toBeVisible();
	});

	it("draws no avatar for a seat nobody holds", () => {
		const { container } = render(<CategoryLeader category={CATEGORY} />);

		expect(container.querySelector("img")).toBeNull();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("still names the category of a seat nobody holds", () => {
		render(<CategoryLeader category={CATEGORY} />);

		expect(screen.getByText(CATEGORY)).toBeVisible();
	});

	it("carries no rule or padding of its own, so both surfaces can place it", () => {
		const { container } = render(
			<CategoryLeader category={CATEGORY} leader={SABRINA} />
		);

		expect(container.firstChild).not.toHaveClass("border-t");
		expect(container.firstChild).not.toHaveClass("px-4");
	});
});
