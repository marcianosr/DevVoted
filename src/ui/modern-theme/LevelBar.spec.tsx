import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LevelBar } from "./LevelBar.ui";

const segmentsOf = (container: HTMLElement) => [
	...container.querySelectorAll("span[aria-hidden]"),
];

describe("LevelBar", () => {
	it("draws a segment per level the config could reach", () => {
		const { container } = render(<LevelBar level={2} maxLevel={5} />);

		expect(segmentsOf(container)).toHaveLength(5);
	});

	it("fills only the levels reached", () => {
		const { container } = render(<LevelBar level={2} maxLevel={5} />);
		const filled = segmentsOf(container).filter((segment) =>
			segment.className.includes("bg-zinc-300")
		);

		expect(filled).toHaveLength(2);
	});

	it("keeps the empty track darker than a grade cell", () => {
		const { container } = render(<LevelBar level={1} maxLevel={5} />);
		const [, second] = segmentsOf(container);

		expect(second).toHaveClass("bg-zinc-800");
	});

	it("reads its position out for a screen reader", () => {
		render(<LevelBar level={3} maxLevel={5} />);

		expect(screen.getByRole("meter")).toHaveAttribute(
			"aria-label",
			"level 3 of 5"
		);
	});

	it("fills whole for a config at its ceiling", () => {
		const { container } = render(<LevelBar level={2} maxLevel={2} />);
		const filled = segmentsOf(container).filter((segment) =>
			segment.className.includes("bg-zinc-300")
		);

		expect(filled).toHaveLength(2);
	});
});
