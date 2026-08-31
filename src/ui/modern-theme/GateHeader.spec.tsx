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

	it("leaves the gate's swatch empty until the gate is cleared", () => {
		const { container } = render(<GateHeader title="Gate 4 · Lavender" />);

		expect(container.querySelector(".border-dashed")).toBeInTheDocument();
		expect(container.querySelector(".bg-theme")).not.toBeInTheDocument();
	});

	it("carries the balance between the gate and its stats", () => {
		render(
			<GateHeader title="Gate 4 · Lavender" storage={{ balanceKb: 184 }} />
		);

		expect(screen.getByText("184 KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("shows the audit condition the gate runs under", () => {
		render(
			<GateHeader title="Gate 4 · Lavender" audits={["dependency-outage"]} />
		);

		expect(screen.getByText("1 audit")).toHaveClass("text-saffron");
		expect(screen.getByText("Dependency Outage")).toHaveClass("text-saffron");
	});

	it("counts the audits it was given rather than being told a number", () => {
		render(
			<GateHeader
				title="Gate 10 · Earth"
				audits={["breaking-change", "timeout"]}
			/>
		);

		expect(screen.getByText("2 audits")).toBeInTheDocument();
		expect(screen.getByText("Breaking Change")).toBeInTheDocument();
		expect(screen.getByText("Timeout")).toBeInTheDocument();
	});

	it("says nothing about audits when the gate runs clean", () => {
		render(<GateHeader title="Gate 4 · Lavender" />);

		expect(screen.queryByText(/audit/)).not.toBeInTheDocument();
	});

	it("lays the gate ladder under the identity row", () => {
		render(
			<GateHeader
				title="Gate 4 · Lavender"
				track={{
					gates: [
						{ gate: 0, theme: "pallet" },
						{ gate: 1, theme: "lavender" },
						{ gate: 2, theme: "cascade" },
					],
					cleared: 1,
				}}
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

	it("scores the run against the gate's demand under the ladder", () => {
		render(
			<GateHeader
				title="Gate 4 · Lavender"
				coverage={{ held: 12, projected: 4, required: 40 }}
			/>
		);

		expect(screen.getByText("Coverage")).toBeInTheDocument();
		expect(
			screen.getByText((_, node) => node?.textContent === "12 / 40%")
		).toBeTruthy();
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuemax",
			"40"
		);
	});

	it("scales the bar against the demand, so a small goal still fills the track", () => {
		render(
			<GateHeader
				title="Gate 1 · Pallet"
				coverage={{ held: 0, projected: 1, required: 3 }}
			/>
		);

		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuemax",
			"3"
		);
	});
});
