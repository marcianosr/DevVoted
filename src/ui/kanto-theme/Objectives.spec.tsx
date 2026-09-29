import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	Objectives,
	type Objective,
	type ObjectivesProps,
} from "./Objectives.ui";

const PALLET = gateSwatchAt(0);

const CLEAR: Objective = {
	statement: ["Finish at ", { band: "ok" }, " or better"],
	earns: [
		"earns ",
		{ figure: "advance to Boulder" },
		{ figure: "+13 KB", band: "ok" },
		" or more",
	],
};

const SWATCH: Objective = {
	statement: ["Answer all 5 right"],
	earns: ["earns ", { swatch: PALLET, label: "Pallet swatch" }],
};

const draw = (props: Partial<ObjectivesProps> = {}) =>
	render(<Objectives objectives={[CLEAR, SWATCH]} {...props} />);

describe("Objectives", () => {
	it("states the band an objective asks for and the reward it pays", () => {
		draw();

		expect(screen.getByText("Finish at")).toBeInTheDocument();
		expect(screen.getByText("OK")).toBeInTheDocument();
		expect(screen.getByText("or better")).toBeInTheDocument();
		expect(screen.getByText("advance to Boulder")).toBeInTheDocument();
		expect(screen.getByText("+13 KB")).toBeInTheDocument();
	});

	it("colours a band figure with the band it names", () => {
		draw();

		expect(screen.getByText("OK")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("colours a payout with the band that pays it", () => {
		draw();

		expect(screen.getByText("+13 KB")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("marks a swatch reward with the gate's own swatch", () => {
		const { container } = draw();

		expect(screen.getByText("Pallet swatch")).toBeInTheDocument();
		expect(
			container.querySelector('[data-swatch-theme="pallet"]')
		).not.toBeNull();
	});

	it("asks for a flawless window rather than a coverage band for the swatch", () => {
		draw();

		expect(screen.getByText("Answer all 5 right")).toBeInTheDocument();
		expect(screen.queryByText("PERFECT")).not.toBeInTheDocument();
	});

	it("rules every objective off from the one above it", () => {
		const { container } = draw();

		const ruled = container.querySelectorAll(".border-t");

		expect(ruled).toHaveLength(1);
		expect(ruled[0]?.textContent).toContain("Answer all 5 right");
	});

	it("leaves the first objective unruled", () => {
		const { container } = draw({ objectives: [CLEAR] });

		expect(container.querySelector(".border-t")).toBeNull();
	});

	it("marks nothing as met or out of reach", () => {
		draw();

		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("draws nothing when a gate states no objectives", () => {
		const { container } = draw({ objectives: [] });

		expect(container).toBeEmptyDOMElement();
	});
});
