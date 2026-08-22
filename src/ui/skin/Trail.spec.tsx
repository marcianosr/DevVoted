import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Trail, type TrailItem } from "./Trail.ui";

const items: readonly TrailItem[] = [
	{ id: "gate", label: "gate 4", state: "answered", verdict: "pass" },
	{ id: "poll-1", label: "poll 1", suffix: "css", state: "current" },
	{ id: "poll-2", label: "poll 2", state: "disabled" },
];

describe("Trail", () => {
	it("names itself for a screen reader", () => {
		render(<Trail items={items} label="Gate 4 progress" />);

		expect(
			screen.getByRole("navigation", { name: "Gate 4 progress" })
		).toBeInTheDocument();
	});

	it("puts a separator between crumbs but not before the first", () => {
		const { container } = render(
			<Trail items={items} label="Gate 4 progress" />
		);

		expect(container.textContent?.match(/›/g)).toHaveLength(items.length - 1);
		expect(container.textContent?.startsWith("gate 4")).toBe(true);
	});
});
