import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	BandOutcomes,
	type BandOutcome,
	type LeadLine,
} from "./BandOutcomes.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
} from "./CoverageBar.ui";

const TITLE = "At stake";
const LEAD_TEXT = "Clear at ";
const LEAD: readonly LeadLine[] = [[LEAD_TEXT, { band: "ok" }, " or better."]];
const NOTE =
	"Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs.";

const OUTCOMES: readonly BandOutcome[] = [
	{ band: "perfect", range: "100%", pays: "+1305 KB" },
	{ band: "healthy", range: "75 – 99%", pays: "+870 KB" },
	{ band: "ok", range: "60 – 74%", pays: "+522 KB" },
	{ band: "shaky", range: "50 – 59%", pays: "−64 KB peel" },
	{ band: "danger", range: "under 50%", pays: "the run ends" },
];

const draw = () => render(<BandOutcomes title={TITLE} outcomes={OUTCOMES} />);

const rowFor = (band: string) =>
	screen.getByText(band).closest("div") as HTMLElement;

const themeOf = (node: Element | null) =>
	node?.getAttribute("data-screen-theme");

describe("BandOutcomes", () => {
	it("names every band the gate can close in", () => {
		draw();

		for (const band of ["PERFECT", "HEALTHY", "OK", "SHAKY", "DANGER"]) {
			expect(screen.getByText(band)).toBeInTheDocument();
		}
	});

	it("takes its words from the bar, so the two readouts cannot drift", () => {
		draw();

		for (const outcome of OUTCOMES) {
			expect(
				screen.getByText(COVERAGE_BAND_WORD[outcome.band])
			).toBeInTheDocument();
		}
	});

	it("states each band's range and what it pays, and nothing else", () => {
		draw();

		const row = rowFor("HEALTHY");

		expect(within(row).getByText("75 – 99%")).toBeInTheDocument();
		expect(within(row).getByText("+870 KB")).toBeInTheDocument();
	});

	it("heads three columns, the outcome prose having left the table", () => {
		draw();

		for (const heading of ["band", "coverage", "pays"]) {
			expect(screen.getByText(heading)).toBeInTheDocument();
		}
		expect(screen.queryByText("outcome")).not.toBeInTheDocument();
	});

	it("bills the holding band a peel rather than paying it", () => {
		draw();

		expect(
			within(rowFor("SHAKY")).getByText("−64 KB peel")
		).toBeInTheDocument();
	});

	it("says the fatal band ends the run instead of quoting it a figure", () => {
		draw();

		expect(
			within(rowFor("DANGER")).getByText("the run ends")
		).toBeInTheDocument();
	});

	it("wears each band's own colour on the badge and the figure alike", () => {
		draw();

		expect(themeOf(screen.getByText("SHAKY"))).toBe(COVERAGE_BAND_COLOR.shaky);
		expect(themeOf(screen.getByText("−64 KB peel"))).toBe(
			COVERAGE_BAND_COLOR.shaky
		);
	});

	it("reads the fatal row in the colour of the band that ends the run", () => {
		draw();

		expect(themeOf(rowFor("DANGER"))).toBe(COVERAGE_BAND_COLOR.danger);
	});

	it("edges the fatal row even where the run has no reading to stand on", () => {
		draw();

		expect(rowFor("DANGER")).toHaveClass("border-l-2");
		expect(rowFor("SHAKY")).not.toHaveClass("border-l-2");
	});

	it("leaves every survivable row unthemed, the full bar included", () => {
		draw();

		expect(themeOf(rowFor("HEALTHY"))).toBeNull();
		expect(themeOf(rowFor("PERFECT"))).toBeNull();
	});

	it("rules between the outcomes but not above the first", () => {
		const { container } = draw();

		const ruled = [...container.querySelectorAll(".border-t")];

		expect(ruled).toHaveLength(OUTCOMES.length);
		expect(ruled[0]).toHaveClass("first:border-t-0");
	});

	it("heads the table so the screen says what the rows are for", () => {
		draw();

		expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
	});
});

describe("the prose around the table", () => {
	it("draws neither lead nor note when it was handed neither", () => {
		draw();

		expect(screen.queryByText(LEAD_TEXT)).not.toBeInTheDocument();
		expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
	});

	it("stands the lead between the heading and the table it introduces", () => {
		const { container } = render(
			<BandOutcomes title={TITLE} outcomes={OUTCOMES} lead={LEAD} />
		);

		const [lead] = [
			...(container.querySelector("header + div")?.children ?? []),
		];

		expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
		expect(lead).toHaveTextContent("Clear at OK or better.");
	});

	it("puts the note last, under the table it footnotes", () => {
		const { container } = render(
			<BandOutcomes title={TITLE} outcomes={OUTCOMES} note={NOTE} />
		);

		const section = container.querySelector("section") as HTMLElement;
		const last = section.children[section.children.length - 1];

		expect(last).toHaveTextContent(NOTE);
	});
});

describe("the band the run is standing in", () => {
	const standing = (band: CoverageBandId) =>
		render(<BandOutcomes title={TITLE} outcomes={OUTCOMES} standing={band} />);

	const tableRowFor = (band: string): HTMLElement => {
		const cell = screen
			.getAllByText(band)
			.find((node) => node.closest(".coverage-bar") === null);

		const row = cell?.closest("div");
		if (row === null || row === undefined)
			throw new Error(`no table row for "${band}"`);
		return row;
	};

	it("edges the row the run is standing in", () => {
		standing("ok");

		expect(tableRowFor("OK")).toHaveClass("border-l-2");
	});

	it("reads that edge in the colour of the band it marks", () => {
		standing("ok");

		expect(themeOf(tableRowFor("OK"))).toBe(COVERAGE_BAND_COLOR.ok);
	});

	it("leaves the bands the run is not in alone", () => {
		standing("ok");

		expect(tableRowFor("HEALTHY")).not.toHaveClass("border-l-2");
		expect(themeOf(tableRowFor("HEALTHY"))).toBeNull();
		expect(tableRowFor("SHAKY")).not.toHaveClass("border-l-2");
	});

	it("keeps the fatal row edged while the run stands somewhere else", () => {
		standing("ok");

		expect(tableRowFor("DANGER")).toHaveClass("border-l-2");
		expect(themeOf(tableRowFor("DANGER"))).toBe(COVERAGE_BAND_COLOR.danger);
	});

	it("moves the edge with the band the viewmodel read off the bar", () => {
		standing("healthy");

		expect(tableRowFor("HEALTHY")).toHaveClass("border-l-2");
		expect(tableRowFor("OK")).not.toHaveClass("border-l-2");
	});

	it("edges nothing but the fatal row when the table was handed no standing", () => {
		const { container } = draw();

		expect(container.querySelectorAll(".border-l-2")).toHaveLength(1);
	});
});
