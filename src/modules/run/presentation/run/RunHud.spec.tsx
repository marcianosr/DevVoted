import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RunHud } from "./RunHud.ui";

describe(RunHud, () => {
	it("shows storage, gate progress, polls answered", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				category="js"
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		// Storage reads as headroom now: 512 − 120 = 392KB free, in both layouts.
		expect(screen.getAllByText("392")).toHaveLength(2);
		expect(screen.getAllByText("120 of 512 used")).toHaveLength(2);
		// Gates count from 0, so one banked means you are standing on gate 1. Both
		// layouts render the bar, so both copies show up here.
		expect(screen.getAllByRole("group", { name: /gate 1 of 11/ })).toHaveLength(
			2
		);
		expect(screen.getByText("3 / 5")).toBeInTheDocument(); // polls this window
		expect(screen.getAllByText(/polls/)).not.toHaveLength(0);
	});

	it("summarizes covered categories, and reveals every category on expand", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={1}
				pollsPerGate={5}
				coverage={7.5}
				coverageByCategory={{ css: 3, js: 4.5, git: 0 }}
			/>
		);
		// Collapsed: the summary counts only categories with coverage. Scoped to the
		// control, since the gate pips also quote the run's coverage.
		const coverage = screen.getByRole("button", { name: /^Coverage/ });
		expect(coverage).toHaveTextContent("7.5%");
		expect(coverage).toHaveTextContent("across 2 categories");
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
		// Expanded: every category shows — including Git at 0%.
		fireEvent.click(coverage);
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});
});
