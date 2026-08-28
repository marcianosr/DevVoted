import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RunHud } from "~/modules/run/run/presentation/RunHud.ui";

describe(RunHud, () => {
	it("shows storage and gate progress", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={3}
				pollsPerGate={5}
				gateCoverage={0}
				gateCoverageDemand={3}
				coverageByCategory={{}}
			/>
		);
		expect(screen.getAllByText("120 KB")).toHaveLength(2);
		expect(screen.getAllByRole("group", { name: /gate 1 of 11/ })).toHaveLength(
			2
		);
		expect(screen.getByText("Boulder")).toBeInTheDocument();
	});

	it("explains what a gate costs and pays behind its own info icon", () => {
		render(
			<RunHud
				storage={120}
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

	it("explains storage as money rather than as a ceiling", () => {
		render(
			<RunHud
				storage={120}
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
			screen.getByText(/Nothing caps what you can hold/)
		).toBeInTheDocument();
		expect(screen.queryByText(/caps at/)).not.toBeInTheDocument();
	});

	it("summarizes covered categories, and reveals every category on expand", () => {
		render(
			<RunHud
				storage={120}
				gatesCleared={1}
				victoryGate={11}
				pollsAnswered={1}
				pollsPerGate={5}
				gateCoverage={7.5}
				gateCoverageDemand={10}
				coverageByCategory={{ css: 3, js: 4.5, git: 0 }}
			/>
		);
		const coverage = screen.getByRole("button", { name: /^Coverage/ });
		expect(coverage).toHaveTextContent("7.5% / 10% this gate");
		expect(coverage).toHaveTextContent("across 2 categories");
		expect(screen.queryByText("CSS")).not.toBeInTheDocument();
		fireEvent.click(coverage);
		expect(screen.getByText("CSS")).toBeInTheDocument();
		expect(screen.getByText("JavaScript")).toBeInTheDocument();
		expect(screen.getByText("Git")).toBeInTheDocument();
	});
});
