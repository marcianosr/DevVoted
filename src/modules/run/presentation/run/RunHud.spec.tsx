import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

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
				pollOutcomes={[]}
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		// Storage reads as headroom now: 512 − 120 = 392KB free, in both layouts.
		expect(screen.getAllByText("392")).toHaveLength(2);
		expect(screen.getAllByText("120KB of 512KB used")).toHaveLength(2);
		// Gates count from 0, so one banked means you are standing on gate 1. Both
		// layouts render the bar, so both copies show up here.
		expect(screen.getAllByRole("group", { name: /gate 1 of 11/ })).toHaveLength(
			2
		);
		// ...and gate 1 is the Boulder gate: the HUD names it, since that is what the
		// shop, the reward report and the swatch on offer all call it.
		expect(screen.getByText("Boulder")).toBeInTheDocument();
		// Polls this window, in both layouts.
		expect(screen.getAllByText("3 of 5 polls")).toHaveLength(2);
	});

	it("colours the poll bar by how each answer went, dimming the ones to come", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				pollOutcomes={["correct", "wrong", "partial"]}
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		// Scoped to one layout — both render, so every dash appears twice.
		const bar = screen.getAllByRole("group", {
			name: "3 of 5 polls answered",
		})[0];
		const dash = (name: string) =>
			within(bar).getByLabelText(name, { selector: "span" });
		expect(dash("poll 1, correct")).toHaveClass("bg-viridian");
		expect(dash("poll 2, wrong")).toHaveClass("bg-cinnabar");
		expect(dash("poll 3, partly correct")).toHaveClass("bg-saffron");
		// The window's remaining polls stay grey until they are answered.
		expect(dash("poll 4, not answered")).toHaveClass("bg-zinc-700");
		expect(dash("poll 5, not answered")).toHaveClass("bg-zinc-700");
	});

	it("explains what a gate costs and pays behind its own info icon", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				pollOutcomes={[]}
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

	it("summarizes covered categories, and reveals every category on expand", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={1}
				pollsPerGate={5}
				pollOutcomes={[]}
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
