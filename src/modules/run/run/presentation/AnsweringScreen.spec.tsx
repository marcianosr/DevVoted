import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { AnsweringScreen } from "~/modules/run/run/presentation/AnsweringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
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

	it("buys a peek from Telemetry's pipeline row", () => {
		const onPeek = vi.fn();
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.unitTests, CONFIGS.telemetry]}
				canPeek
				peekReady
				peeker={CONFIGS.telemetry}
				peekCost={32}
				onPeek={onPeek}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "use 32KB" }));
		expect(onPeek).toHaveBeenCalledOnce();
	});

	it("disables the peek the balance cannot cover", () => {
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.telemetry]}
				canPeek
				peekReady={false}
				peeker={CONFIGS.telemetry}
				peekCost={64}
				onPeek={vi.fn()}
			/>
		);
		expect(screen.getByRole("button", { name: "use 64KB" })).toBeDisabled();
	});

	it("shows the community share on each option once the peek is bought", () => {
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.telemetry]}
				split={{ percentByOptionId: { a: 71, b: 29 } }}
			/>
		);
		expect(screen.getByText("71%")).toBeInTheDocument();
		expect(screen.getByText("29%")).toBeInTheDocument();
	});

	it("reads an unpicked option as 0% rather than leaving it blank", () => {
		render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.telemetry]}
				split={{ percentByOptionId: { a: 100 } }}
			/>
		);
		expect(screen.getByText("0%")).toBeInTheDocument();
	});

	it("names the sample size only when the split carries one (Telemetry L2)", () => {
		const { rerender } = render(
			<AnsweringScreen
				{...base}
				configs={[CONFIGS.telemetry]}
				split={{ percentByOptionId: { a: 71, b: 29 } }}
			/>
		);
		expect(screen.queryByText(/based on/)).not.toBeInTheDocument();

		rerender(
			<AnsweringScreen
				{...base}
				configs={[{ ...CONFIGS.telemetry, level: 2 }]}
				split={{ percentByOptionId: { a: 71, b: 29 }, answeredCount: 127 }}
			/>
		);
		expect(screen.getByText("based on 127 answers")).toBeInTheDocument();
	});

	it("shows no percentages at all before a peek is paid for", () => {
		render(<AnsweringScreen {...base} configs={[CONFIGS.telemetry]} />);
		expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
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
	it("shows no strip warning — a miss redoes the gate, it never peels (ADR-035)", () => {
		render(<AnsweringScreen {...base} slots={4} />);
		expect(screen.queryByText(/a fail peels/)).not.toBeInTheDocument();
	});
});

// ADR-038: the banner is where a gate's rules live while the polls are being
// played, so every audit that changes the next click has to reach it.
describe("the audit banner", () => {
	const audit = (
		id: string,
		answerCue: string
	): {
		id: string;
		name: string;
		description: string;
		answerCue: string;
		suppressed: boolean;
	} => ({
		id,
		name: id,
		description: `${id} description`,
		answerCue,
		suppressed: false,
	});

	it("keeps every live cue on screen", () => {
		render(
			<AnsweringScreen
				{...base}
				audits={[audit("mirrored", "Answer WRONG to score.")]}
			/>
		);
		expect(screen.getByText("Answer WRONG to score.")).toBeInTheDocument();
	});

	it("drops a cue the defeat device is reporting as passing", () => {
		render(
			<AnsweringScreen
				{...base}
				audits={[
					{ ...audit("mirrored", "Answer WRONG to score."), suppressed: true },
				]}
			/>
		);
		expect(
			screen.queryByText("Answer WRONG to score.")
		).not.toBeInTheDocument();
	});

	it("names every config that is offline right now", () => {
		render(
			<AnsweringScreen
				{...base}
				audits={[audit("dependency-outage", "A dependency is down.")]}
				offlineConfigs={[CONFIGS.eslint, CONFIGS.agentsMd]}
			/>
		);
		expect(screen.getByText("ESLint, AGENTS.md")).toBeInTheDocument();
		expect(screen.getByText(/Offline right now/)).toBeInTheDocument();
	});

	// The mirror rewrites the question itself (ADR-038), so the instruction sits
	// on the card with the options rather than only in the banner.
	it("tells the poll card to ask for the incorrect options", () => {
		render(<AnsweringScreen {...base} mirroredPolls />);
		expect(
			screen.getByText(/pick every INCORRECT option/i)
		).toBeInTheDocument();
	});

	it("leaves the card alone off a mirrored gate", () => {
		render(<AnsweringScreen {...base} />);
		expect(
			screen.queryByText(/pick every INCORRECT option/i)
		).not.toBeInTheDocument();
	});

	it("counts the clock down on a timed poll", () => {
		render(
			<AnsweringScreen
				{...base}
				audits={[audit("timeout-3", "On the clock: 30s.")]}
				timeLimitMs={30_000}
				remainingMs={12_400}
			/>
		);
		// Rounded up: a clock reading 0 while the answer still counts reads broken.
		expect(screen.getByText("13s")).toBeInTheDocument();
	});

	it("says the clock has run out rather than pretending the poll is over", () => {
		render(
			<AnsweringScreen
				{...base}
				audits={[audit("timeout-3", "On the clock: 30s.")]}
				timeLimitMs={30_000}
				remainingMs={0}
			/>
		);
		expect(screen.getByText("out of time")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
	});
});
