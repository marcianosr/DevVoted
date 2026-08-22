import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GateHeader } from "./GateHeader.ui";

describe("GateHeader", () => {
	it("names the gate as a heading", () => {
		render(<GateHeader title="Gate 4 · Lavender" />);

		expect(
			screen.getByRole("heading", { name: "Gate 4 · Lavender" })
		).toBeInTheDocument();
	});

	it("wears the gate's swatch beside the name", () => {
		const { container } = render(<GateHeader title="Gate 4 · Lavender" />);

		expect(container.querySelector(".bg-theme")).toBeInTheDocument();
	});

	it("carries the storage bar between the gate and its stats", () => {
		render(
			<GateHeader
				title="Gate 4 · Lavender"
				storage={{ plan: "Free tier", used: 184, cap: 512 }}
			/>
		);

		expect(screen.getByText("Free tier")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuemax",
			"512"
		);
	});

	it("shows the audit condition the gate runs under", () => {
		render(
			<GateHeader
				title="Gate 4 · Lavender"
				audit="1 audit · Dependency Outage"
			/>
		);

		expect(screen.getByText("1 audit · Dependency Outage")).toHaveClass(
			"text-saffron"
		);
	});

	it("says nothing about audits when the gate runs clean", () => {
		render(<GateHeader title="Gate 4 · Lavender" />);

		expect(screen.queryByText(/audit/)).not.toBeInTheDocument();
	});

	it("lays the gate ladder under the identity row", () => {
		render(
			<GateHeader
				title="Gate 4 · Lavender"
				track={[
					{ gate: 0, state: "earned", theme: "pallet" },
					{ gate: 1, state: "current", theme: "lavender" },
					{ gate: 2, state: "locked" },
				]}
			/>
		);

		expect(screen.getByText("gate 1 / 2")).toBeInTheDocument();
	});

	it("omits the ladder when no track is given", () => {
		render(<GateHeader title="Gate 4 · Lavender" />);

		expect(screen.queryByText(/gate \d+ \//)).not.toBeInTheDocument();
	});

	it("leaves the middle empty when there is no plan to report", () => {
		render(<GateHeader title="Gate 4 · Lavender" />);

		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});
});
