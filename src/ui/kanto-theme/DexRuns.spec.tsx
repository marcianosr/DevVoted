import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { dexRunsProps } from "~/test/dexRegistry.factory";

import { DexRuns, heldOutcomeOf } from "./DexRuns.ui";

describe("heldOutcomeOf", () => {
	it("names the gate that stopped the run", () => {
		expect(heldOutcomeOf("Lavender")).toBe("Lavender held");
	});
});

describe("DexRuns", () => {
	it("names the collection and counts the climbs", () => {
		render(<DexRuns {...dexRunsProps()} />);

		expect(screen.getByRole("heading", { name: "run history" })).toBeVisible();
		expect(screen.getByText("3 runs")).toBeVisible();
	});

	it("shows each run's date, outcome and coverage", () => {
		render(<DexRuns {...dexRunsProps()} />);

		expect(screen.getByText("11 Sep")).toBeVisible();
		expect(screen.getByText("Lavender held")).toBeVisible();
		expect(screen.getByText("56%")).toBeVisible();
	});

	it("bands each run by the one mapping the coverage bar uses", () => {
		render(<DexRuns {...dexRunsProps()} />);

		expect(screen.getByText("HEALTHY")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("DANGER")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
		expect(screen.getByText("SHAKY")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("draws every run against the full gate ladder", () => {
		render(<DexRuns {...dexRunsProps()} />);

		expect(
			screen.getByLabelText("4 of 13 swatches discovered")
		).toBeInTheDocument();
	});
});
