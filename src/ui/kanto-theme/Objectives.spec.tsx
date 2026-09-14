import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	Objectives,
	type Objective,
	type ObjectivesProps,
	type RequiredObjective,
} from "./Objectives.ui";

const REQUIRED: RequiredObjective = {
	lead: "to clear the gate",
	statement: {
		lead: "Finish at",
		figure: "OK",
		color: "saffron",
		trail: "or better",
	},
	explain:
		"That is 40% coverage, or 2 of the 5 right. Anything under it and Boulder stays shut.",
	met: false,
};

const SWATCH: Objective = {
	name: "Earn the Pallet swatch",
	detail: "kept for good",
	met: false,
	requirements: [{ lead: "answer", figure: "5 of 5" }],
};

const SMOKE: Objective = {
	name: "Smoke test",
	detail: "the first answer sets the tone",
	met: false,
	requirements: [{ lead: "answer", figure: "poll 1", trail: "right" }],
};

const OUT_OF_REACH: Objective = { ...SMOKE, lost: true };

const OPTIONAL_LEAD = "also on the table, not required";

const draw = (props: Partial<ObjectivesProps> = {}) =>
	render(
		<Objectives
			required={REQUIRED}
			optional={[SWATCH, SMOKE]}
			optionalLead={OPTIONAL_LEAD}
			{...props}
		/>
	);

const rowFor = (name: string) =>
	screen.getByText(name).closest("div") as HTMLElement;

describe("Objectives", () => {
	it("states the one thing the gate asks, rather than listing it as a chore", () => {
		draw();

		expect(screen.getByText("to clear the gate")).toBeInTheDocument();
		expect(screen.getByText("Finish at")).toBeInTheDocument();
		expect(screen.getByText("OK")).toBeInTheDocument();
		expect(screen.getByText("or better")).toBeInTheDocument();
	});

	it("colours the clearing figure with the band it names", () => {
		draw();

		expect(screen.getByText("OK")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("prices the line in answers as well as in coverage", () => {
		draw();

		expect(screen.getByText(REQUIRED.explain)).toBeInTheDocument();
	});

	it("keeps the clearing line unticked until the run is over it", () => {
		draw();

		expect(screen.queryByRole("img", { name: "met" })).not.toBeInTheDocument();
	});

	it("ticks the clearing line once the run holds it", () => {
		draw({ required: { ...REQUIRED, met: true } });

		expect(screen.getByRole("img", { name: "met" })).toBeInTheDocument();
	});

	it("sets the other prizes apart as things nobody has to do", () => {
		draw();

		expect(screen.getByText(OPTIONAL_LEAD)).toBeInTheDocument();
		expect(screen.getByText("Earn the Pallet swatch")).toBeInTheDocument();
		expect(screen.getByText("Smoke test")).toBeInTheDocument();
	});

	it("offers an unwon prize with a plus, never an unticked box", () => {
		const { container } = draw();

		const mark = within(rowFor("Earn the Pallet swatch")).getByRole("img", {
			name: "not yet",
		});

		expect(mark).toHaveTextContent("+");
		expect(mark).not.toHaveClass("border-dashed");
		expect(container.querySelector(".border-dashed")).toBeNull();
	});

	it("ticks a prize already won", () => {
		draw({ optional: [{ ...SWATCH, met: true }, SMOKE] });

		expect(
			within(rowFor("Earn the Pallet swatch")).getByRole("img", { name: "met" })
		).toBeInTheDocument();
	});

	it("strikes a prize the window can no longer reach", () => {
		draw({ optional: [SWATCH, OUT_OF_REACH] });

		expect(
			within(rowFor("Smoke test")).getByRole("img", { name: "out of reach" })
		).toBeInTheDocument();
		expect(screen.getByText("Smoke test")).toHaveClass("line-through");
	});

	it("shows an optional prize its figure alone, the words being the line's", () => {
		draw();

		const row = within(rowFor("Smoke test"));

		expect(row.getByText("poll 1")).toBeInTheDocument();
		expect(row.queryByText("answer")).toBeNull();
		expect(row.queryByText("right")).toBeNull();
	});

	it("rules the optional prizes off from the line that is not optional", () => {
		const { container } = draw();

		const ruled = container.querySelector(".border-t");

		expect(ruled).not.toBeNull();
		expect(
			within(ruled as HTMLElement).getByText(OPTIONAL_LEAD)
		).toBeInTheDocument();
		expect(
			within(ruled as HTMLElement).queryByText("to clear the gate")
		).toBeNull();
	});

	it("drops the whole block when a gate offers nothing on the side", () => {
		draw({ optional: [] });

		expect(screen.queryByText(OPTIONAL_LEAD)).not.toBeInTheDocument();
		expect(screen.getByText("Finish at")).toBeInTheDocument();
	});
});
