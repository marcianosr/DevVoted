import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RunHud } from "./RunHud.ui";

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
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		// Both layouts render the gauge, so its text shows up twice.
		expect(screen.getAllByText("120 KB / 512 KB used")).toHaveLength(2);
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
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		const hint = screen.getByRole("button", { name: "How gates work" });
		expect(hint).toHaveTextContent("ⓘ");
		// The numbers come from the run's own rules, not a hardcoded blurb: a 5-poll
		// window and a gate 11 summit have to read back out of the explanation.
		expect(screen.getByText(/Each gate is 5 polls/)).toHaveTextContent(
			"Gate 11 ends the climb."
		);
	});

	it("names the free plan behind the storage info icon", () => {
		render(
			<RunHud
				storage={120}
				capKb={512}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		expect(screen.getByText(/the free plan — no bill\./)).toBeInTheDocument();
	});

	it("names the current plan's bill behind the storage info icon", () => {
		render(
			<RunHud
				storage={120}
				capKb={640}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		expect(
			screen.getByText(
				/this plan bills 8KB every closed window, pass or fail\./
			)
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
