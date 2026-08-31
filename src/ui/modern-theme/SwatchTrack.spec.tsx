import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SwatchTrack, type SwatchTrackGate } from "./SwatchTrack.ui";

/** A stand-in ladder, not the live roster. This proves SwatchTrack maps a
 * position onto cell states; importing the real thirteen gates would break the
 * spec whenever a gate was added, and `ui-stays-presentational` forbids a spec
 * under src/ui reaching a module for runtime values anyway. The stories render
 * the real roster. Elite's plate and Champion's fill are here because the
 * withholding rules below are about finishes. */
const GATES: readonly SwatchTrackGate[] = [
	{ gate: 0, theme: "pallet" },
	{ gate: 1, theme: "cascade" },
	{ gate: 2, theme: "lavender" },
	{ gate: 3, theme: "elite", finish: "plate" },
	{ gate: 4, theme: "champion", finish: "fill" },
];

describe("SwatchTrack", () => {
	it("renders one square per gate on the ladder", () => {
		const { container } = render(<SwatchTrack gates={GATES} cleared={2} />);

		expect(container.querySelectorAll("span.size-3")).toHaveLength(5);
	});

	it("labels the gate by its own number, not its position in the row", () => {
		render(<SwatchTrack gates={GATES} cleared={2} />);

		expect(screen.getByText("gate 2 / 4")).toBeInTheDocument();
	});

	it("counts what was banked when no gate is current", () => {
		render(<SwatchTrack gates={GATES} cleared={2} atCleared="locked" />);

		expect(screen.getByText("2 / 5 gates cleared")).toBeInTheDocument();
	});

	it("counts the collection rather than the climb when asked for swatches", () => {
		render(
			<SwatchTrack
				gates={GATES}
				cleared={2}
				atCleared="locked"
				counting="swatches"
			/>
		);

		expect(screen.getByText("2 of 5 collected")).toBeInTheDocument();
	});

	it("stacks the label under the squares instead of beside them", () => {
		const { container } = render(
			<SwatchTrack gates={GATES} cleared={2} layout="stacked" />
		);

		expect(container.firstChild).toHaveClass("flex-col");
		expect(container.firstChild).not.toHaveClass("flex-wrap");
	});

	it("outlines only the gate being played, in that gate's own colour", () => {
		const { container } = render(<SwatchTrack gates={GATES} cleared={2} />);

		const outlined = container.querySelectorAll(".outline-theme");
		expect(outlined).toHaveLength(1);
		expect(outlined[0]).toHaveAttribute("data-swatch-theme", "lavender");
	});

	it("leaves gates not yet reached without a gate colour", () => {
		const { container } = render(<SwatchTrack gates={GATES} cleared={2} />);

		expect(container.querySelectorAll(".bg-zinc-800")).toHaveLength(2);
		expect(container.querySelectorAll("[data-swatch-theme]")).toHaveLength(3);
	});

	// The roster carries Champion's gradient and Elite's rim, so a run that has
	// not reached them must not paint either.
	it("withholds a finish the run has not reached", () => {
		const { container } = render(<SwatchTrack gates={GATES} cleared={2} />);

		expect(container.querySelectorAll(".bg-legendary")).toHaveLength(0);
		expect(container.querySelectorAll(".ring-pewter")).toHaveLength(0);
	});

	it("wears Elite's rim and Champion's gradient once they are earned", () => {
		const { container } = render(
			<SwatchTrack gates={GATES} cleared={5} atCleared="locked" />
		);

		expect(container.querySelectorAll(".ring-pewter")).toHaveLength(1);
		expect(container.querySelectorAll(".bg-legendary")).toHaveLength(1);
	});

	// A won run stands past the last gate, so gates[cleared] does not exist and
	// there is no gate number to name.
	it("names no current gate once the ladder is finished", () => {
		render(<SwatchTrack gates={GATES} cleared={5} />);

		expect(screen.getByText("5 / 5 gates cleared")).toBeInTheDocument();
	});

	it("marks exactly one cell as awaiting its swatch", () => {
		const { container } = render(
			<SwatchTrack gates={GATES} cleared={2} atCleared="pending" />
		);

		expect(container.querySelectorAll(".border-dashed")).toHaveLength(1);
		expect(container.querySelectorAll(".outline-theme")).toHaveLength(0);
	});

	it("hides the squares from screen readers, which read the label instead", () => {
		const { container } = render(<SwatchTrack gates={GATES} cleared={2} />);

		expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});
});
