import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RunReadout } from "./RunReadout.ui";

describe("RunReadout", () => {
	it("states the run number and the gate out of the total", () => {
		render(<RunReadout runNumber={2} gate={3} gates={12} />);

		expect(screen.getByText("#2")).toBeVisible();
		expect(screen.getByText("3")).toBeVisible();
		expect(screen.getByText("12")).toBeVisible();
	});

	it("drops the run part while the run number is still loading", () => {
		render(<RunReadout runNumber={null} gate={0} gates={12} />);

		expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
		expect(screen.getByText("12")).toBeVisible();
	});
});
