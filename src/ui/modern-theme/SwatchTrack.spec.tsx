import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SwatchTrack, type SwatchTrackItem } from "./SwatchTrack.ui";

const ladder = (current: number, gates = 13): SwatchTrackItem[] =>
	Array.from({ length: gates }, (_, gate) => {
		if (gate < current) return { gate, state: "earned", theme: "pallet" };
		if (gate === current) return { gate, state: "current", theme: "lavender" };
		return { gate, state: "locked" };
	});

describe("SwatchTrack", () => {
	it("renders one square per gate on the ladder", () => {
		const { container } = render(<SwatchTrack items={ladder(4)} />);

		expect(container.querySelectorAll("span.size-4")).toHaveLength(13);
	});

	it("labels the gate by its own number, not its position in the row", () => {
		render(<SwatchTrack items={ladder(4)} />);

		expect(screen.getByText("gate 4 / 12")).toBeInTheDocument();
	});

	it("counts what was banked when no gate is current", () => {
		const items = ladder(4).map((item) =>
			item.state === "current"
				? ({ gate: item.gate, state: "locked" } satisfies SwatchTrackItem)
				: item
		);

		render(<SwatchTrack items={items} />);

		expect(screen.getByText("4 / 13 gates cleared")).toBeInTheDocument();
	});

	it("counts the collection rather than the climb when asked for swatches", () => {
		const items = ladder(4).map((item) =>
			item.state === "current"
				? ({ gate: item.gate, state: "locked" } satisfies SwatchTrackItem)
				: item
		);

		render(<SwatchTrack items={items} counting="swatches" />);

		expect(screen.getByText("4 of 13 collected")).toBeInTheDocument();
	});

	it("stacks the label under the squares instead of beside them", () => {
		const { container } = render(
			<SwatchTrack items={ladder(4)} layout="stacked" />
		);

		expect(container.firstChild).toHaveClass("flex-col");
		expect(container.firstChild).not.toHaveClass("flex-wrap");
	});

	it("outlines only the gate being played", () => {
		const { container } = render(<SwatchTrack items={ladder(4)} />);

		const outlined = container.querySelectorAll(".outline-theme");
		expect(outlined).toHaveLength(1);
		expect(outlined[0]).toHaveAttribute("data-swatch-theme", "lavender");
	});

	it("leaves gates not yet reached without a gate colour", () => {
		const { container } = render(<SwatchTrack items={ladder(4)} />);

		expect(container.querySelectorAll(".bg-zinc-800")).toHaveLength(8);
	});

	it("hides the squares from screen readers, which read the label instead", () => {
		const { container } = render(<SwatchTrack items={ladder(4)} />);

		expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});
});
