import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { POLL_PAYS_TITLE, PollPays, type PollPaysProps } from "./PollPays.ui";

const CASCADE = 2;

const props: PollPaysProps = {
	slotsOpen: "15 slots open",
	codebase: {
		gates: [
			{ swatch: gateSwatchAt(0), covered: 5, slots: 5 },
			{ swatch: gateSwatchAt(1), covered: 3, slots: 5 },
			{ swatch: gateSwatchAt(CASCADE), covered: 0, slots: 5, current: true },
		],
		label: "8 of 15 slots covered",
	},
	standing: [
		"The codebase grew from ",
		{ figure: "10" },
		" to ",
		{ figure: "15" },
		" slots. The same ",
		{ figure: "8", band: "ok" },
		" units read ",
		{ figure: "80.0%" },
		" at Boulder and ",
		{ figure: "53.3%", band: "ok" },
		" here. ",
		"Nothing was lost.",
	],
	bar: {
		held: 53.3,
		floor: 40,
		ok: 53.3,
		healthy: 60,
		marks: "rungs",
		pin: true,
	},
	rows: [
		{ answer: "single answer", units: "1 unit", share: "+6.67%" },
		{
			answer: "single answer",
			via: ".ts ×1.25",
			units: "1.25 units",
			share: "+8.33%",
		},
		{ answer: "multiple answers", units: "2 units", share: "+13.33%" },
	],
};

const panel = () =>
	screen
		.getByRole("heading", { name: POLL_PAYS_TITLE })
		.closest("section") as HTMLElement;

const follows = (later: Element, earlier: Element) =>
	Boolean(
		earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING
	);

describe("PollPays", () => {
	it("titles the panel and counts the open slots beside it", () => {
		render(<PollPays {...props} />);

		expect(within(panel()).getByText("15 slots open")).toHaveClass(
			"badge-theme"
		);
	});

	it("stands the codebase above the bar, and the bar above the rows", () => {
		const { container } = render(<PollPays {...props} />);

		const codebase = screen.getByRole("img", { name: "8 of 15 slots covered" });
		const bar = container.querySelector(".coverage-bar") as HTMLElement;
		const [rows] = screen.getAllByText("single answer");

		expect(follows(bar, codebase)).toBe(true);
		expect(follows(rows, bar)).toBe(true);
	});

	it("states the standing as one sentence under the squares", () => {
		render(<PollPays {...props} />);

		expect(
			screen.getByText(/Nothing was lost\./).closest("p")
		).toHaveTextContent(
			"The codebase grew from 10 to 15 slots. The same 8 units read 80.0% at Boulder and 53.3% here. Nothing was lost."
		);
	});

	it("prices every answer in units and as a share of the codebase, both badged", () => {
		render(<PollPays {...props} />);

		expect(screen.getByText("1.25 units")).toHaveClass("badge-theme");
		expect(screen.getByText("+8.33%")).toHaveClass("badge-theme");
		expect(screen.getByText(".ts ×1.25")).toBeInTheDocument();
		expect(screen.getAllByText("single answer")).toHaveLength(2);
		expect(screen.getByText("multiple answers")).toBeInTheDocument();
	});

	it("colours the share as a gain and leaves the units in the screen's colour", () => {
		render(<PollPays {...props} />);

		expect(screen.getByText("+6.67%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("1 unit")).not.toHaveAttribute("data-screen-theme");
	});

	it("names what is owed to the clearing band only when something is", () => {
		const { rerender } = render(<PollPays {...props} />);

		expect(screen.queryByText(/reaches/)).toBeNull();

		rerender(
			<PollPays
				{...props}
				owed={[
					{ figure: "+1 unit", band: "ok" },
					" reaches ",
					{ band: "ok" },
					".",
				]}
			/>
		);

		expect(screen.getByText(/reaches/).closest("p")).toHaveTextContent(
			"+1 unit reaches OK."
		);
	});

	it("footnotes what a unit is, last", () => {
		render(<PollPays {...props} />);

		const section = panel();
		const last = section.children[section.children.length - 1];

		expect(last).toHaveTextContent(/A unit covers one slot of the codebase\./);
	});
});
