import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GateTracker } from "./GateTracker.ui";

describe(GateTracker, () => {
	it("marks cleared gates done, the next gate now, and the rest ahead", () => {
		render(<GateTracker total={3} cleared={1} />);
		expect(screen.getByText("✓ done")).toBeInTheDocument();
		expect(screen.getByText("now")).toBeInTheDocument();
		expect(screen.getByText("ahead")).toBeInTheDocument();
	});

	it("renders one cell per gate", () => {
		render(<GateTracker total={5} cleared={2} />);
		expect(screen.getByText("Gate 1")).toBeInTheDocument();
		expect(screen.getByText("Gate 5")).toBeInTheDocument();
	});
});
