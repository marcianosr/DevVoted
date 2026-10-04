import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { COPY, WornTitles } from "./WornTitles.ui";

describe("WornTitles", () => {
	it("badges every worn title, because a player may wear more than one", () => {
		render(<WornTitles titles={["Summit", "First Ascent"]} />);

		expect(screen.getByText("Summit")).toHaveClass("badge-theme");
		expect(screen.getByText("First Ascent")).toHaveClass("badge-theme");
	});

	it("keeps the titles in the order they were equipped", () => {
		render(<WornTitles titles={["Summit", "First Ascent"]} />);

		const worn = screen.getAllByText(/Summit|First Ascent/);

		expect(worn.map((title) => title.textContent)).toEqual([
			"Summit",
			"First Ascent",
		]);
	});

	it("offers an empty slot rather than nothing when no title is worn", () => {
		render(<WornTitles titles={[]} />);

		const empty = screen.getByText(COPY.noTitle);

		expect(empty).toHaveClass("border-dashed");
		expect(empty).not.toHaveClass("badge-theme");
	});
});
