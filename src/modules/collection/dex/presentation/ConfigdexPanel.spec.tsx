import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

const STARTERS = FREE_CONFIG_IDS.map((configId) => ({
	configId,
	viaMetric: null,
}));

const sizeHeading = (size: string): HTMLElement => {
	const heading = screen
		.getAllByText(size)
		.find((node) => !node.className.includes("sr-only"));
	if (!heading) throw new Error(`No ${size} heading rendered`);
	return heading;
};

describe(ConfigdexPanel, () => {
	it("counts granted against the whole roster, per group and in total", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);
		expect(screen.getByText("8/35 collected")).toBeInTheDocument();
		expect(sizeHeading("1 slot").closest("header")?.textContent).toContain(
			"5/17"
		);
	});

	it("teaches each size with the KB it costs to draft", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);
		const header = sizeHeading("8 slots").closest("header");

		expect(header?.textContent).toContain("256 KB");
	});

	it("orders the groups biggest first", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);
		const headings = screen
			.getAllByRole("banner")
			.map((header) => header.querySelector("p")?.textContent);

		expect(headings).toEqual(["8 slots", "4 slots", "2 slots", "1 slot"]);
	});

	it("skips a size no config on the roster uses yet", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);

		expect(screen.queryByText("12 slots")).not.toBeInTheDocument();
		expect(screen.queryByText("16 slots")).not.toBeInTheDocument();
	});

	it("hides a locked config behind ??? — never its name", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);

		expect(screen.getAllByText("???").length).toBeGreaterThan(0);
		expect(screen.queryByText("Telemetry")).not.toBeInTheDocument();
		expect(screen.queryByText("AGENTS.md")).not.toBeInTheDocument();
	});

	it("prints both unlock paths as visible text with live counts", () => {
		render(
			<ConfigdexPanel
				entries={configdex(STARTERS, [
					{ metric: "community-peeks", count: 3 },
					{ metric: "polls-answered", count: 43 },
				])}
			/>
		);

		expect(
			screen.getByText(
				(_, node) =>
					node?.textContent === "Peek the community split 5 times · 3/5"
			)
		).toBeInTheDocument();
		expect(
			screen.getAllByText(
				(_, node) => node?.textContent === "or Answer 100 polls · 43/100"
			).length
		).toBeGreaterThan(0);
	});

	it("renders a one-shot path as a checkbox without a count", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);

		const oneShot = screen.getByText(
			(_, node) =>
				node?.textContent === "☐ Clear Marsh's Mirror audit without a miss"
		);
		expect(oneShot).toBeInTheDocument();
		expect(oneShot.textContent).not.toMatch(/\d+\/\d+/);
	});

	it("reads a starter as provenance, not an earning", () => {
		render(<ConfigdexPanel entries={configdex(STARTERS, [])} />);

		expect(screen.getAllByText("Starter config")).toHaveLength(
			FREE_CONFIG_IDS.length
		);
	});

	it("prints an earned row's provenance beside its named chip", () => {
		render(
			<ConfigdexPanel
				entries={configdex(
					[...STARTERS, { configId: "telemetry", viaMetric: "polls-answered" }],
					[]
				)}
			/>
		);

		expect(screen.getByText("Telemetry")).toBeInTheDocument();
		expect(screen.getByText("Earned: answered 100 polls")).toBeInTheDocument();
	});
});
