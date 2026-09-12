import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { BandOutcomes, type BandOutcome } from "./BandOutcomes.ui";
import { COVERAGE_BAND_COLOR, COVERAGE_BAND_WORD } from "./CoverageBar.ui";

const TITLE = "Where you finish decides everything";

const OUTCOMES: readonly BandOutcome[] = [
	{
		band: "perfect",
		range: "100%",
		outcome: "The bar is full. The gate pays a bonus on top.",
		pays: "1305 KB",
	},
	{
		band: "healthy",
		range: "75 – 99%",
		outcome: "Gate cleared.",
		pays: "653 KB – 870 KB",
	},
	{
		band: "ok",
		range: "60 – 74%",
		outcome: "You survive and get paid, but the gate stays shut.",
		pays: "522 KB – 644 KB",
	},
	{
		band: "shaky",
		range: "50 – 59%",
		outcome: "Still alive, barely.",
		pays: "435 KB – 513 KB",
	},
	{
		band: "danger",
		range: "under 50%",
		outcome: "The run ends the moment the gate shuts.",
		pays: "Nothing",
	},
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

	it("states each band's range and what it pays", () => {
		draw();

		expect(within(rowFor("HEALTHY")).getByText("75 – 99%")).toBeInTheDocument();
		expect(
			within(rowFor("HEALTHY")).getByText("653 KB – 870 KB")
		).toBeInTheDocument();
	});

	it("pays the fatal band nothing at all", () => {
		draw();

		expect(within(rowFor("DANGER")).getByText("Nothing")).toBeInTheDocument();
	});

	it("wears each band's own colour on the badge and the figure alike", () => {
		draw();

		expect(themeOf(screen.getByText("SHAKY"))).toBe(COVERAGE_BAND_COLOR.shaky);
		expect(themeOf(screen.getByText("435 KB – 513 KB"))).toBe(
			COVERAGE_BAND_COLOR.shaky
		);
	});

	it("reads the run ending in the colour of the band that ends it", () => {
		draw();

		expect(
			themeOf(screen.getByText("The run ends the moment the gate shuts."))
		).toBe(COVERAGE_BAND_COLOR.danger);
	});

	it("leaves every survivable outcome in plain prose, the full bar included", () => {
		draw();

		expect(themeOf(screen.getByText("Gate cleared."))).toBeNull();
		expect(
			themeOf(
				screen.getByText("The bar is full. The gate pays a bonus on top.")
			)
		).toBeNull();
	});

	it("rules between the outcomes but not above the first", () => {
		const { container } = draw();

		expect(container.querySelectorAll(".border-t")).toHaveLength(
			OUTCOMES.length - 1
		);
	});

	it("heads the table so the screen says what the rows are for", () => {
		draw();

		expect(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
	});
});

describe("the ladder the outcomes are cut from", () => {
	const LADDER = { held: 0, floor: 50, ok: 60, healthy: 75 };

	it("draws no bar for a table that was handed none", () => {
		const { container } = render(
			<BandOutcomes title={TITLE} outcomes={OUTCOMES} />
		);

		expect(container.querySelector(".coverage-bar")).toBeNull();
	});

	it("stands the bar between the heading and the table it explains", () => {
		const { container } = render(
			<BandOutcomes title={TITLE} outcomes={OUTCOMES} bar={LADDER} />
		);

		const section = container.querySelector("section") as HTMLElement;
		const [heading, bar] = [...section.children];

		expect(heading).toHaveRole("heading");
		expect(bar).toHaveClass("coverage-bar");
	});

	it("reads the same line the table cuts its bands on", () => {
		render(<BandOutcomes title={TITLE} outcomes={OUTCOMES} bar={LADDER} />);

		expect(
			screen.getByRole("img", { name: /0% of 75% needed/ })
		).toBeInTheDocument();
	});

	it("carries the note the bar was given, so the ladder says what reaches it", () => {
		render(
			<BandOutcomes
				title={TITLE}
				outcomes={OUTCOMES}
				bar={{ ...LADDER, note: "three correct polls reaches the line" }}
			/>
		);

		expect(
			screen.getByText("three correct polls reaches the line")
		).toBeInTheDocument();
	});
});

describe("the outcomes read down a narrow column", () => {
	const draw = () =>
		render(<BandOutcomes title={TITLE} outcomes={OUTCOMES} layout="stacked" />);

	it("gives the sentence the whole width instead of a fixed column", () => {
		draw();

		const prose = screen.getByText("Gate cleared.");

		expect(prose).not.toHaveClass("flex-1");
		expect(prose.previousElementSibling).toHaveClass("flex", "w-full");
	});

	it("heads each outcome with its band, its range and what it pays", () => {
		draw();

		const head = screen.getByText("75 – 99%").parentElement as HTMLElement;

		expect(within(head).getByText("HEALTHY")).toBeInTheDocument();
		expect(within(head).getByText("653 KB – 870 KB")).toBeInTheDocument();
	});

	it("pushes the payout opposite the band it belongs to", () => {
		draw();

		expect(screen.getByText("1305 KB").parentElement).toHaveClass("ml-auto");
	});

	it("still rules between the outcomes but not above the first", () => {
		const { container } = draw();

		expect(container.querySelectorAll(".border-t")).toHaveLength(
			OUTCOMES.length - 1
		);
	});

	it("keeps the fatal outcome red, the layout not owning the colour", () => {
		draw();

		expect(
			screen
				.getByText("The run ends the moment the gate shuts.")
				.getAttribute("data-screen-theme")
		).toBe(COVERAGE_BAND_COLOR.danger);
	});

	it("leaves the wide rows alone, a full-width table still being a row", () => {
		render(<BandOutcomes title={TITLE} outcomes={OUTCOMES} />);

		expect(screen.getByText("Gate cleared.")).toHaveClass("flex-1");
	});
});
