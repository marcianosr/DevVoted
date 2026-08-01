import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RunHud } from "./RunHud.ui";

const gateCheck = {
	label: "Correct",
	progress: "1/2",
	current: 1,
	target: 2,
	state: "running" as const,
	sourceConfigId: "unit-tests",
};

describe(RunHud, () => {
	it("shows storage, gate progress, polls answered, and the streak", () => {
		render(
			<RunHud
				storage={120}
				gateNumber={2}
				victoryGate={5}
				pollsAnswered={3}
				pollsPerGate={5}
				streak={2}
				category="js"
				coverage={0}
				coverageByCategory={{}}
				configs={[]}
				slots={3}
				checks={[]}
			/>
		);
		// The bar renders both the desktop and the compact mobile layout.
		expect(screen.getAllByText("120KB")).not.toHaveLength(0);
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
		expect(screen.getByText("3 / 5")).toBeInTheDocument();
		expect(screen.getAllByText(/polls/)).not.toHaveLength(0);
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("streak")).toBeInTheDocument();
	});

	// Realigned after bf64bab: the mobile Stakes panel shows streak, coverage,
	// and the equipped config chips — per-check progress moved off the HUD.
	it("reveals the gate stakes behind the mobile Stakes dropdown", () => {
		render(
			<RunHud
				storage={76}
				gateNumber={4}
				victoryGate={5}
				pollsAnswered={0}
				pollsPerGate={5}
				streak={3}
				category="js"
				coverage={12}
				coverageByCategory={{}}
				configs={[CONFIGS.unitTests]}
				slots={3}
				checks={[gateCheck]}
			/>
		);
		expect(screen.queryByText("Unit Tests")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Stakes/ }));
		expect(screen.getByText("Streak")).toBeInTheDocument();
		// Both the desktop summary and the opened panel state the coverage.
		expect(screen.getAllByText("12%").length).toBeGreaterThan(0);
		expect(screen.getByText("Unit Tests")).toBeInTheDocument();
	});

	it("summarizes covered categories, and reveals every category on expand", () => {
		render(
			<RunHud
				storage={120}
				gateNumber={2}
				victoryGate={5}
				pollsAnswered={1}
				pollsPerGate={5}
				streak={1}
				coverage={7.5}
				coverageByCategory={{ css: 3, js: 4.5, git: 0 }}
				configs={[]}
				slots={3}
				checks={[]}
			/>
		);
		// Collapsed: the summary counts only categories with coverage.
		expect(screen.getByText("7.5%")).toBeInTheDocument();
		expect(screen.getByText(/across 2 categories/)).toBeInTheDocument();
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
		// Expanded: every category shows — including Git at 0%.
		fireEvent.click(screen.getByRole("button", { name: /coverage/i }));
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});

	// Realigned after bf64bab: the standalone Loadout expander is gone; equipped
	// configs reveal behind the Stakes dropdown instead.
	it("reveals the equipped configs behind the Stakes dropdown", () => {
		render(
			<RunHud
				storage={120}
				gateNumber={2}
				victoryGate={5}
				pollsAnswered={1}
				pollsPerGate={5}
				streak={1}
				coverage={0}
				coverageByCategory={{}}
				configs={[CONFIGS.eslint]}
				slots={3}
				checks={[]}
			/>
		);
		expect(screen.queryByText("ESLint")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Stakes/ }));
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});
});
