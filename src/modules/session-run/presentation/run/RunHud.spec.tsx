import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { RunHud } from "./RunHud.ui";

describe("RunHud", () => {
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
			/>
		);
		expect(screen.getByText("120KB")).toBeInTheDocument();
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
		expect(screen.getByText("3 / 5")).toBeInTheDocument();
		expect(screen.getByText(/polls/)).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("streak")).toBeInTheDocument();
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

	it("reveals the equipped configs on expanding the loadout", () => {
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
			/>
		);
		expect(screen.queryByText("ESLint")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Loadout/ }));
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});
});
