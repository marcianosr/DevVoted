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
	scores: {
		rows: [
			{
				swatch: gateSwatchAt(LAVENDER_GATE),
				correct: 3,
				polls: 5,
				current: true,
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
	standing: [
		{ figure: "+4%", gain: true },
		" to reach ",
		{ band: "healthy" },
		" · ",
		{ figure: "2" },
		" polls left",
	],
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

	it("reads the objectives, today's answers, the ladder, the standing and the note, in that order", () => {
		const { container } = render(<BandOutcomes {...props} />);

		const objective = screen.getByText("Finish at");
		const scores = screen.getByLabelText(/^Lavender —/);
		const ladder = container.querySelector(".band-ladder") as HTMLElement;
		const standing = screen.getByText(/polls left/).closest("p") as HTMLElement;
		const note = screen.getByText(NOTE);

		expect(follows(objective, scores)).toBe(true);
		expect(follows(scores, ladder)).toBe(true);
		expect(follows(ladder, standing)).toBe(true);
		expect(follows(standing, note)).toBe(true);
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

	it("states the standing line under the ladder with its figures badged", () => {
		render(<BandOutcomes {...props} />);

		const standing = screen.getByText(/polls left/).closest("p") as HTMLElement;

		expect(standing).toHaveTextContent("+4% to reach HEALTHY · 2 polls left");
		expect(within(standing).getByText("+4%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(within(standing).getByText("2")).toHaveClass("badge-theme");
	});

	it("draws neither answers nor a note when handed neither", () => {
		render(<BandOutcomes {...props} scores={undefined} note={undefined} />);

		expect(screen.queryByLabelText(/^Lavender —/)).toBeNull();
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
