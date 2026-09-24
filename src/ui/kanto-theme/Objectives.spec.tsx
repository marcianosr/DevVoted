import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	Objectives,
	type Objective,
	type ObjectivesProps,
} from "./Objectives.ui";

const REQUIRED_LEAD = "Main objective";
const OPTIONAL_LEAD = "Extra objectives";

const REQUIRED: Objective = {
	statement: {
		lead: "Finish at",
		figure: "OK",
		color: "saffron",
		trail: "or better",
	},
	explain: "to clear the gate",
	met: false,
};

const SWATCH: Objective = {
	statement: { lead: "Finish at", figure: "PERFECT", color: "cerulean" },
	explain: "to earn the Pallet swatch",
	met: false,
	figures: [{ label: "5 of 5" }],
};

const AUDIT: Objective = {
	statement: {
		lead: "Finish at",
		figure: "HEALTHY",
		color: "viridian",
		trail: "or better",
	},
	explain: "to arm an audit",
	met: false,
};

const draw = (props: Partial<ObjectivesProps> = {}) =>
	render(
		<Objectives
			requiredLead={REQUIRED_LEAD}
			required={REQUIRED}
			optional={[SWATCH, AUDIT]}
			optionalLead={OPTIONAL_LEAD}
			{...props}
		/>
	);

const blockFor = (explain: string): HTMLElement => {
	const block = screen.getByText(explain).closest("div")?.parentElement;
	if (block === null || block === undefined)
		throw new Error(`no objective block around "${explain}"`);
	return block;
};

describe("Objectives", () => {
	it("names the required block and states the band it asks for", () => {
		draw();

		const required = within(blockFor("to clear the gate"));

		expect(screen.getByText(REQUIRED_LEAD)).toBeInTheDocument();
		expect(required.getByText("Finish at")).toBeInTheDocument();
		expect(required.getByText("OK")).toBeInTheDocument();
		expect(required.getByText("or better")).toBeInTheDocument();
	});

	it("colours the clearing figure with the band it names", () => {
		draw();

		expect(screen.getByText("OK")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("leaves the clearing line unmarked until the run is over it", () => {
		draw();

		expect(screen.queryByRole("img", { name: "met" })).not.toBeInTheDocument();
	});

	it("ticks the clearing line once the run holds it", () => {
		draw({ required: { ...REQUIRED, met: true } });

		expect(screen.getByRole("img", { name: "met" })).toBeInTheDocument();
	});

	it("states every extra the same way the required one is stated", () => {
		draw();

		expect(screen.getByText(OPTIONAL_LEAD)).toBeInTheDocument();
		expect(screen.getByText("to earn the Pallet swatch")).toBeInTheDocument();
		expect(screen.getByText("to arm an audit")).toBeInTheDocument();
		expect(screen.getByText("PERFECT")).toBeInTheDocument();
		expect(screen.getByText("HEALTHY")).toBeInTheDocument();
	});

	it("marks an unwon extra with nothing at all", () => {
		draw();

		expect(
			within(blockFor("to earn the Pallet swatch")).queryByRole("img")
		).toBeNull();
	});

	it("ticks an extra already won", () => {
		draw({ optional: [{ ...SWATCH, met: true }, AUDIT] });

		expect(
			within(blockFor("to earn the Pallet swatch")).getByRole("img", {
				name: "met",
			})
		).toBeInTheDocument();
	});

	it("crosses an extra the window can no longer reach", () => {
		draw({ optional: [SWATCH, { ...AUDIT, lost: true }] });

		expect(
			within(blockFor("to arm an audit")).getByRole("img", {
				name: "out of reach",
			})
		).toBeInTheDocument();
	});

	it("carries an extra's own figure beside what it buys", () => {
		draw();

		expect(
			within(blockFor("to earn the Pallet swatch")).getByText("5 of 5")
		).toBeInTheDocument();
	});

	it("rules the extras off from the line that is not optional", () => {
		const { container } = draw();

		const ruled = container.querySelector(".border-t");

		expect(ruled).not.toBeNull();
		expect(ruled?.textContent).toContain(OPTIONAL_LEAD);
		expect(ruled?.textContent).not.toContain(REQUIRED_LEAD);
	});

	it("drops the whole block when a gate offers nothing on the side", () => {
		draw({ optional: [] });

		expect(screen.queryByText(OPTIONAL_LEAD)).not.toBeInTheDocument();
		expect(screen.getByText("to clear the gate")).toBeInTheDocument();
	});
});
