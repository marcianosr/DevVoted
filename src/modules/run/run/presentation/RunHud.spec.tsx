import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RunHud } from "~/modules/run/run/presentation/RunHud.ui";

describe(RunHud, () => {
	it("shows storage and gate progress", () => {
		render(
			<RunHud
				storage={120}
				capKb={512}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				gateCoverage={0}
				gateCoverageDemand={3}
				coverageByCategory={{}}
			/>
		);
		// Both layouts render the gauge, so its text shows up twice.
		expect(screen.getAllByText("120 / 512 KB stored")).toHaveLength(2);
		// Gates count from 0, so one banked means you are standing on gate 1. Both
		// layouts render the bar, so both copies show up here.
		expect(screen.getAllByRole("group", { name: /gate 1 of 11/ })).toHaveLength(
			2
		);
		// ...and gate 1 is the Boulder gate: the HUD names it, since that is what the
		// shop, the reward report and the swatch on offer all call it.
		expect(screen.getByText("Boulder")).toBeInTheDocument();
	});

	it("explains what a gate costs and pays behind its own info icon", () => {
		render(
			<RunHud
				storage={120}
				capKb={512}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				gateCoverage={0}
				gateCoverageDemand={3}
				coverageByCategory={{}}
			/>
		);
		const hint = screen.getByRole("button", { name: "How gates work" });
		expect(hint).toHaveTextContent("ⓘ");
		expect(screen.getByText(/Each gate deals 5 polls/)).toHaveTextContent(
			"miss it and the gate peels a config, then you shop and run the same gate again"
		);
	});

	it("explains the storage cap behind the storage info icon", () => {
		render(
			<RunHud
				storage={120}
				capKb={512}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				gateCoverage={0}
				gateCoverageDemand={3}
				coverageByCategory={{}}
			/>
		);
		const hint = screen.getByRole("button", { name: "How storage works" });
		expect(hint).toHaveTextContent("ⓘ");
		expect(
			screen.getByText(/Current storage caps at 512KB/)
		).toBeInTheDocument();
	});

	it("reads the cap in the storage explanation from the run, not a hardcoded blurb", () => {
		render(
			<RunHud
				storage={120}
				capKb={640}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				gateCoverage={0}
				gateCoverageDemand={3}
				coverageByCategory={{}}
			/>
		);
		expect(
			screen.getByText(/Current storage caps at 640KB/)
		).toBeInTheDocument();
	});

	it("summarizes covered categories, and reveals every category on expand", () => {
		render(
			<RunHud
				storage={120}
				capKb={512}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={1}
				pollsPerGate={5}
				gateCoverage={7.5}
				gateCoverageDemand={10}
				coverageByCategory={{ css: 3, js: 4.5, git: 0 }}
			/>
		);
		// Collapsed: the label reads the gate meter against its demand (ADR-035);
		// the summary counts only categories with career coverage.
		const coverage = screen.getByRole("button", { name: /^Coverage/ });
		expect(coverage).toHaveTextContent("7.5% / 10% this gate");
		expect(coverage).toHaveTextContent("across 2 categories");
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
		// Expanded: every category shows — including Git at 0%.
		fireEvent.click(coverage);
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});
});
