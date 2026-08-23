import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AuditsPanel, type DexAudit } from "./AuditsPanel.ui";

const COST_OVERRUN: DexAudit = {
	id: "cost-overrun",
	tier: "faced",
	gates: [3],
	rule: "Every paid action costs double, linting and peeking both.",
};

const MIRROR: DexAudit = {
	id: "mirrored",
	tier: "unlocked",
	gates: [7, 11],
	rule: "Every poll asks for the incorrect options, and wants all of them.",
};

describe("AuditsPanel", () => {
	it("marks the ones you have actually run into", () => {
		render(<AuditsPanel audits={[COST_OVERRUN, MIRROR]} />);

		expect(screen.getAllByText("faced")).toHaveLength(1);
	});

	it("names an audit you have not met yet, and still says what it does", () => {
		render(<AuditsPanel audits={[MIRROR]} />);

		expect(screen.getByText("Mirror")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Every poll asks for the incorrect options, and wants all of them."
			)
		).toBeInTheDocument();
	});

	it("fades a row you have not met, so faced ones lead", () => {
		const { container } = render(<AuditsPanel audits={[MIRROR]} />);

		expect(container.querySelector("li")).toHaveClass("opacity-50");
	});

	it("leaves a faced row at full strength", () => {
		const { container } = render(<AuditsPanel audits={[COST_OVERRUN]} />);

		expect(container.querySelector("li")).not.toHaveClass("opacity-50");
	});

	it("counts one gate as a gate and several as gates", () => {
		render(<AuditsPanel audits={[COST_OVERRUN, MIRROR]} />);

		expect(screen.getByText("gate 3")).toBeInTheDocument();
		expect(screen.getByText("gates 7, 11")).toBeInTheDocument();
	});

	it("redacts an audit you have never seen, name and rule both", () => {
		render(<AuditsPanel audits={[{ id: "strip", tier: "unseen" }]} />);

		expect(screen.getAllByText("???")).toHaveLength(2);
		expect(screen.queryByText("Strip")).toBeNull();
	});

	// Scoped to the row: the panel's own blurb names gates 3, 8 and 11, so an
	// unscoped /gate/ query passes whatever the row does.
	it("says nothing about which gates an unseen audit sits on", () => {
		render(<AuditsPanel audits={[{ id: "strip", tier: "unseen" }]} />);
		const row = screen.getByRole("listitem");

		expect(within(row).queryByText(/gate/)).toBeNull();
	});

	it("tints a met audit in the colour audits wear everywhere else", () => {
		const { container } = render(
			<AuditsPanel audits={[COST_OVERRUN, MIRROR]} />
		);
		const [faced, unlocked] = Array.from(container.querySelectorAll("svg"));

		expect(faced).toHaveClass("text-saffron");
		expect(unlocked).not.toHaveClass("text-saffron");
	});
});
