import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RunHud } from "./RunHud.ui";

describe("RunHud", () => {
	it("shows storage, gate progress, and polls to clear", () => {
		render(
			<RunHud
				storage={120}
				gateNumber={2}
				victoryGate={5}
				pollsToGate={4}
				coverage={0}
				coverageByCategory={{}}
			/>
		);
		expect(screen.getByText("120KB")).toBeInTheDocument();
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
		expect(screen.getByText(/polls to clear/)).toBeInTheDocument();
	});

	it("summarizes earned coverage and reveals the breakdown on expand", () => {
		render(
			<RunHud
				storage={120}
				gateNumber={2}
				victoryGate={5}
				pollsToGate={4}
				coverage={7.5}
				coverageByCategory={{ css: 3, js: 4.5, git: 0 }}
			/>
		);
		// Collapsed: a summary, not the individual chips.
		expect(screen.getByText("7.5%")).toBeInTheDocument();
		expect(screen.getByText(/across 2 categories/)).toBeInTheDocument();
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
		// Expanded: the earned categories (Git, at 0%, stays hidden).
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.queryByText("Git")).not.toBeInTheDocument();
	});
});
