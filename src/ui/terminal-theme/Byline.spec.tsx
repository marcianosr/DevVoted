import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Byline } from "./Byline.ui";

describe("Byline", () => {
	it("credits the handle", () => {
		render(<Byline handle="@matthijsgroen" />);

		expect(screen.getByText(/Created by @matthijsgroen/)).toBeInTheDocument();
	});

	it("appends the title when the author has one", () => {
		render(<Byline handle="@matthijsgroen" title="Poll editor" />);

		expect(
			screen.getByText(/Created by @matthijsgroen · Poll editor/)
		).toBeInTheDocument();
	});

	it("stands the handle's first letter in when there is no photo", () => {
		render(<Byline handle="@matthijsgroen" />);

		expect(screen.getByText("M")).toBeInTheDocument();
	});

	it("draws the photo and the equipped border over it", () => {
		const { container } = render(
			<Byline
				handle="@matthijsgroen"
				avatarUrl="https://github.com/matthijsgroen.png"
				borderUrl="/borders/stack-trace.png"
			/>
		);

		const sources = Array.from(container.querySelectorAll("img")).map((image) =>
			image.getAttribute("src")
		);
		expect(sources).toEqual([
			"https://github.com/matthijsgroen.png",
			"/borders/stack-trace.png",
		]);
		expect(screen.queryByText("M")).not.toBeInTheDocument();
	});
});
