import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { AnsweringScreen } from "./AnsweringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
	checks: [
		{
			label: "Correct",
			progress: "1/2",
			current: 1,
			target: 2,
			state: "running" as const,
			sourceConfigId: "unit-tests",
		},
	],
	category: "react" as const,
	question: "Which key?",
	answerType: "single" as const,
	options: [
		{ id: "a", label: "A stable unique id" },
		{ id: "b", label: "The array index" },
	],
	pollOutcomes: [],
	pollsPerGate: 5,
	canSubmit: true,
	onSelect: vi.fn(),
	onSubmit: vi.fn(),
	onNext: vi.fn(),
};

describe(AnsweringScreen, () => {
	it("renders the poll question and the gate checklist", () => {
		render(<AnsweringScreen {...base} />);
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		// The pipeline strip and its role row both name the config now.
		expect(screen.getAllByText("Unit Tests")).not.toHaveLength(0);
	});

	it("shows how many polls have been answered this window", () => {
		render(
			<AnsweringScreen
				{...base}
				pollOutcomes={["correct", "wrong", "partial"]}
			/>
		);
		expect(screen.getByText("3 of 5 polls")).toBeInTheDocument();
	});

	it("colours the poll bar by how each answer went, dimming the ones to come", () => {
		render(
			<AnsweringScreen
				{...base}
				pollOutcomes={["correct", "wrong", "partial"]}
			/>
		);
		const bar = screen.getByRole("group", { name: "3 of 5 polls answered" });
		const dash = (name: string) =>
			within(bar).getByLabelText(name, { selector: "span" });
		expect(dash("poll 1, correct")).toHaveClass("bg-viridian");
		expect(dash("poll 2, wrong")).toHaveClass("bg-cinnabar");
		expect(dash("poll 3, partly correct")).toHaveClass("bg-saffron");
		// The window's remaining polls stay grey until they are answered.
		expect(dash("poll 4, not answered")).toHaveClass("bg-zinc-700");
		expect(dash("poll 5, not answered")).toHaveClass("bg-zinc-700");
	});

	it("answers a poll option", () => {
		const onSelect = vi.fn();
		render(<AnsweringScreen {...base} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: /A stable unique id/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
	});

	it("submits the selected answer", () => {
		const onSubmit = vi.fn();
		render(<AnsweringScreen {...base} onSubmit={onSubmit} />);
		fireEvent.click(screen.getByRole("button", { name: /Submit answer/ }));
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("disables submit when nothing is selected", () => {
		render(<AnsweringScreen {...base} canSubmit={false} />);
		expect(
			screen.getByRole("button", { name: /Submit answer/ })
		).toBeDisabled();
	});

	it("runs the linter from its pipeline row", () => {
		const onLint = vi.fn();
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.unitTests, CONFIGS.eslint]}
				canLint
				lintReady
				linter={CONFIGS.eslint}
				lintCost={8}
				onLint={onLint}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "use 8KB" }));
		expect(onLint).toHaveBeenCalledOnce();
	});

	// The use-button is the affordance; the dot stays an honest check state
	// (DVTD-0dkp — no more ▸ mark on a usable-but-idle linter).
	it("keeps an idle linter's dot at skipped even while usable", () => {
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.eslint]}
				checks={[
					{
						label: "ESLint linted",
						progress: "0/0",
						current: 0,
						target: 0,
						state: "skipped",
						sourceConfigId: "eslint",
					},
				]}
				canLint
				lintReady
				linter={CONFIGS.eslint}
				lintCost={8}
				onLint={vi.fn()}
			/>
		);
		expect(screen.getByRole("button", { name: "use 8KB" })).toBeEnabled();
		expect(
			screen.queryByRole("img", { name: "usable" })
		).not.toBeInTheDocument();
		expect(screen.getByRole("img", { name: "skipped" })).toBeInTheDocument();
	});

	it("heads the pipeline section like the configure screen, slots counted", () => {
		render(<AnsweringScreen {...base} slots={4} />);
		expect(
			screen.getByRole("heading", { name: "Your pipeline" })
		).toBeInTheDocument();
		expect(screen.getByText("2 of 4 slots used")).toBeInTheDocument();
	});

	it("swaps Submit for a Next button once the answer is revealed", () => {
		const onNext = vi.fn();
		render(
			<AnsweringScreen
				{...base}
				correctOptionIds={["a"]}
				chosenOptionIds={["b"]}
				revealScore={{
					isCorrect: true,
					baseCoverage: 1,
					streakBonus: 0.1,
					configBonuses: [{ configId: "js", value: 0.5 }],
					earnedCoverage: 1.6,
				}}
				onNext={onNext}
			/>
		);
		expect(
			screen.queryByRole("button", { name: /Submit answer/ })
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Next/ }));
		expect(onNext).toHaveBeenCalledOnce();
	});

	it("shows the coverage equation with a config chip on reveal", () => {
		render(
			<AnsweringScreen
				{...base}
				correctOptionIds={["a"]}
				chosenOptionIds={["a"]}
				revealScore={{
					isCorrect: true,
					baseCoverage: 1,
					streakBonus: 0.1,
					configBonuses: [{ configId: "js", value: 0.5 }],
					earnedCoverage: 1.6,
				}}
			/>
		);
		// The equipped .js config is resolved to its chip inside the equation.
		expect(screen.getAllByText(".js")).not.toHaveLength(0);
		expect(screen.getByText("+1.6%")).toBeInTheDocument();
	});
	it("warns what a failed gate would peel at this depth", () => {
		// base holds 2 configs; a shallow gate peels 1, so there is margin.
		render(<AnsweringScreen {...base} slots={4} stripsOnFailure={1} />);
		expect(screen.getByText("a fail peels 1")).toBeInTheDocument();
	});

	it("reads the warning as fatal once the quota meets the build's size", () => {
		// From around gate 4 the quota outgrows a narrow pipeline: one bad window
		// strips it bare, and a bare build cannot clear (ADR-017) — that is death.
		render(<AnsweringScreen {...base} slots={4} stripsOnFailure={2} />);
		const warning = screen.getByText("a fail peels all 2 — run over");
		expect(warning).toBeInTheDocument();
		expect(warning).toHaveClass("text-cinnabar");
	});

	it("shows no stake warning when the depth is not supplied", () => {
		render(<AnsweringScreen {...base} slots={4} />);
		expect(screen.queryByText(/a fail peels/)).not.toBeInTheDocument();
	});
});
