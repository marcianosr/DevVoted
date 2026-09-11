import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Author, githubAvatarUrl } from "./Author.ui";

const BORDER = "/borders/grass.png";

describe("githubAvatarUrl", () => {
	it("builds the avatar URL from the handle alone", () => {
		expect(githubAvatarUrl("matthijsgroen")).toBe(
			"https://github.com/matthijsgroen.png"
		);
	});

	it("tolerates a handle written with its at sign", () => {
		expect(githubAvatarUrl("@matthijsgroen")).toBe(
			"https://github.com/matthijsgroen.png"
		);
	});
});

describe("Author", () => {
	it("credits the handle, with its at sign", () => {
		render(<Author handle="matthijsgroen" />);

		expect(screen.getByText("Created by @matthijsgroen")).toBeInTheDocument();
	});

	it("does not double the at sign on a handle that already has one", () => {
		render(<Author handle="@matthijsgroen" />);

		expect(screen.getByText("Created by @matthijsgroen")).toBeInTheDocument();
	});

	it("appends the author's title after a separator", () => {
		render(<Author handle="matthijsgroen" title="Poll editor" />);

		expect(
			screen.getByText("Created by @matthijsgroen · Poll editor")
		).toBeInTheDocument();
	});

	it("omits the separator when the author has no title", () => {
		render(<Author handle="matthijsgroen" />);

		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});

	it("pulls the avatar from GitHub off the handle", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		const photo = container.querySelector("img");
		expect(photo).toHaveAttribute(
			"src",
			"https://github.com/matthijsgroen.png"
		);
	});

	it("lays the equipped border over the avatar when the user has one", () => {
		const { container } = render(
			<Author handle="matthijsgroen" borderUrl={BORDER} />
		);

		const images = Array.from(container.querySelectorAll("img"));
		expect(images).toHaveLength(2);
		expect(images[1]).toHaveAttribute("src", BORDER);
		expect(images[1]).toHaveClass("scale-120");
	});

	it("draws no frame for a user with nothing equipped", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		expect(container.querySelectorAll("img")).toHaveLength(1);
	});

	it("keeps the avatar square so border art is not clipped", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		const face = container.querySelector("span > span");
		expect(face).toHaveClass("rounded-sm");
		expect(face?.className).not.toMatch(/rounded-full/);
	});

	it("sits the handle's initial behind the photo as a fallback", () => {
		render(<Author handle="matthijsgroen" />);

		expect(screen.getByText("M")).toBeInTheDocument();
	});

	it("rules off from whatever sits above it", () => {
		const { container } = render(<Author handle="matthijsgroen" />);

		expect(container.firstChild).toHaveClass("border-t", "border-edge", "pt-3");
	});
});
