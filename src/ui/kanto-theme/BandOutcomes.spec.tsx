import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { BandOutcomes, type BandOutcomesProps } from "./BandOutcomes.ui";
import { COVERAGE_BAND_COLOR } from "./CoverageBar.ui";

const LAVENDER_GATE = 4;
const TITLE = "At stake";
const NOTE =
	"Received at the end of the gate. Miss it and you owe a peel, settled in KB or in configs.";

const props: BandOutcomesProps = {
	title: TITLE,
	meta: ["Lavender · gate ", { figure: "4" }],
	objectives: {
		objectives: [
			{
				statement: [
					"Finish at ",
					{ band: "ok" },
					" (",
					{ figure: "56%", band: "ok" },
					")",
					" or better",
				],
				earns: [
					"earns the ",
					{ figure: "advance to Celadon" },
					" and ",
					{ figure: "+40 KB", band: "ok" },
					" or more",
				],
			},
			{
				statement: ["Reach ", { figure: "100%", band: "perfect" }, " coverage"],
				earns: [
					"earns ",
					{ swatch: gateSwatchAt(LAVENDER_GATE), label: "Lavender swatch" },
					" and ",
					{ figure: "+96 KB", band: "perfect" },
				],
			},
		],
	},
	ladder: {
		held: 58,
		band: "ok",
		lines: { floor: 48, ok: 56, healthy: 62 },
		rungs: [
			{ band: "danger", from: 0, to: 48, pays: "the run ends" },
			{ band: "shaky", from: 48, to: 56, pays: "−64 KB peel" },
			{ band: "ok", from: 56, to: 62, pays: "+40 KB" },
			{ band: "healthy", from: 62, to: 100, pays: "+58 KB" },
			{ band: "perfect", from: 100, to: 100, pays: "+96 KB" },
		],
	},
	note: NOTE,
};

const follows = (before: Element, after: Element) =>
	Boolean(
		before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING
	);

const sectionOf = (container: HTMLElement) =>
	container.querySelector("section") as HTMLElement;

describe("BandOutcomes", () => {
	it("heads itself with the gate it prices, the number badged", () => {
		const { container } = render(<BandOutcomes {...props} />);

		const header = container.querySelector("header") as HTMLElement;

		expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
		expect(header).toHaveTextContent("Lavender · gate 4");
		expect(within(header).getByText("4")).toHaveClass("badge-theme");
	});

	it("reads the objectives, the ladder and the note, in that order", () => {
		const { container } = render(<BandOutcomes {...props} />);

		const objective = screen.getByText("Finish at");
		const ladder = container.querySelector(".band-ladder") as HTMLElement;
		const note = screen.getByText(NOTE);

		expect(follows(objective, ladder)).toBe(true);
		expect(follows(ladder, note)).toBe(true);
	});

	it("states neither the gate's answers nor a standing line", () => {
		render(<BandOutcomes {...props} />);

		expect(screen.queryByLabelText(/^Lavender —/)).toBeNull();
		expect(screen.queryByText(/polls left/)).toBeNull();
	});

	it("draws the ladder inside the panel with no column headings around it", () => {
		const { container } = render(<BandOutcomes {...props} />);

		const ladder = container.querySelector(".band-ladder") as HTMLElement;
		const around = within(ladder.parentElement as HTMLElement);

		expect(sectionOf(container)).toContainElement(ladder);
		expect(around.queryByText("coverage")).toBeNull();
		expect(around.queryByText("pays")).toBeNull();
	});

	it("rings the rung the run stands in, read off the ladder's own numbers", () => {
		const { container } = render(<BandOutcomes {...props} />);

		expect(container.querySelector(".band-ladder-row.ring-2")).toHaveAttribute(
			"data-screen-theme",
			COVERAGE_BAND_COLOR.ok
		);
	});

	it("draws no note when handed none", () => {
		render(<BandOutcomes {...props} note={undefined} />);

		expect(screen.queryByText(NOTE)).toBeNull();
	});

	it("puts the note last, under the ladder it footnotes", () => {
		const { container } = render(<BandOutcomes {...props} />);

		const section = sectionOf(container);

		expect(section.children[section.children.length - 1]).toHaveTextContent(
			NOTE
		);
	});
});
