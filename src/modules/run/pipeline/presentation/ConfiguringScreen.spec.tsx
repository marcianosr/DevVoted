import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	STARTER_STACKS,
	starterStackFor,
} from "~/modules/run/config/domain/stack.model";
import { MAX_SPOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import { ConfiguringScreen } from "~/modules/run/pipeline/presentation/ConfiguringScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const base = {
	stake: createMockGateStake({
		modifiers: {
			gateReward: 80,
			rewardMultiplier: 1,
			coverageMultiplier: 1,
			coverageAdd: 0,
		},
		perAnswer: {
			coveragePerCorrect: 1,
			coveragePerWrong: -0.3,
			storageKbPerCorrect: 0,
			streakStepMultiplier: 1.1,
			streakCapMultiplier: 2,
		},
	}),
	configs: [CONFIGS.unitTests, CONFIGS.js],
	spots: 4,
	spotsUsed: 2,
	spotsFree: 2,
	overflowSpots: 0,
	bench: [CONFIGS.eslint, CONFIGS.agentsMd],
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
	startAction: { label: "Start run →", onClick: vi.fn() },
};

describe(ConfiguringScreen, () => {
	it("names the first gate — no separate prep screen for gate 0", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
	});

	it("sections the stake as the gate, then its outcomes", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText(/5 polls/)).toBeInTheDocument();
		expect(screen.getByText("Gate cleared")).toBeInTheDocument();
		expect(screen.getByText("+80KB")).toHaveClass("text-gradient-green");
		expect(screen.queryByText("×1")).not.toBeInTheDocument();
		expect(
			screen.getByText(/Miss the target: the gate peels/)
		).toBeInTheDocument();
	});

	it("keeps the stake in plain language, no pipeline jargon", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText(/Clear your pipeline/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/satisfy your config checks/)
		).not.toBeInTheDocument();
	});

	it("states the peel as the miss cost, with no game over behind it (ADR-037)", () => {
		render(<ConfiguringScreen {...base} configs={base.configs} />);
		expect(
			screen.getByText(/Miss the target: the gate peels/)
		).toHaveTextContent("peels 1 config, then you shop and run it again");
		expect(screen.queryByText(/ends the run/)).not.toBeInTheDocument();
	});

	it("previews the clear reward a hovered bench config would add, old to new", () => {
		render(
			<ConfiguringScreen
				{...base}
				configs={[CONFIGS.js]}
				stake={createMockGateStake({
					modifiers: { ...base.stake.modifiers, gateReward: 32 },
				})}
				bench={[CONFIGS.unitTests]}
			/>
		);
		fireEvent.mouseOver(screen.getByRole("button", { name: "Unit Tests" }));
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		expect(receipt.getByText("+32KB")).toHaveClass("text-pewter");
		expect(receipt.getByText("→ +64KB")).toHaveClass("text-celadon");
	});

	it("renders the bench and pipeline columns side by side", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByText("Click a config to add it to your pipeline")
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Your pipeline" })
		).toBeInTheDocument();
	});

	it("disables the bench chips once the pipeline is full", () => {
		const onSlot = vi.fn();
		render(
			<ConfiguringScreen
				{...base}
				configs={[CONFIGS.unitTests, CONFIGS.js, CONFIGS.css]}
				spotsUsed={4}
				spotsFree={0}
				onSlot={onSlot}
			/>
		);
		const chip = screen.getByRole("button", { name: /ESLint/ });
		expect(chip).toBeDisabled();
		fireEvent.click(chip);
		expect(onSlot).not.toHaveBeenCalled();
	});

	it("names both sources of width instead of showing an unclaimable rung", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent ===
					`Clearing gates widens the pipeline, and the shop rents spots on top, up to ${MAX_SPOTS} spots.`
			)
		).toBeInTheDocument();
		expect(screen.queryByText(/reached/)).not.toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"coverage toward gate 0"
		);
	});

	it("numbers only the spots the pipeline actually has", () => {
		render(<ConfiguringScreen {...base} />);
		for (const spot of ["1", "2", "3", "4"])
			expect(
				screen.getByText(spot, { selector: ".tabular-nums" })
			).toBeInTheDocument();
		expect(
			screen.queryByText("5", { selector: ".tabular-nums" })
		).not.toBeInTheDocument();
	});

	it("drops the width promise once the pipeline is on the top rung", () => {
		render(<ConfiguringScreen {...base} spots={MAX_SPOTS} />);
		expect(screen.queryByText(/widens the pipeline/)).not.toBeInTheDocument();
	});

	const foldedDetailFor = (text: string) =>
		screen.getByText(text).parentElement?.parentElement?.parentElement;

	const foldable = {
		...base,
		configs: [CONFIGS.eslint, CONFIGS.js],
		bench: [CONFIGS.agentsMd],
	};
	const ESLINT_GIVES = "Cross out a wrong answer on JS/TS polls";

	it("opens each row's effect by default, above the fold breakpoint", () => {
		render(<ConfiguringScreen {...foldable} />);
		expect(foldedDetailFor(ESLINT_GIVES)).toHaveClass("hidden", "sm:flex");
	});

	it("folds a row to one line when its name is tapped", () => {
		render(<ConfiguringScreen {...foldable} />);
		fireEvent.click(screen.getByRole("button", { name: "ESLint" }));
		const detail = foldedDetailFor(ESLINT_GIVES);
		expect(detail).toHaveClass("hidden");
		expect(detail).not.toHaveClass("sm:flex");
	});

	it("folds a tapped-shut row back open on the next tap", () => {
		render(<ConfiguringScreen {...foldable} />);
		const name = screen.getByRole("button", { name: "ESLint" });
		fireEvent.click(name);
		fireEvent.click(name);
		expect(foldedDetailFor(ESLINT_GIVES)).toHaveClass("flex");
		expect(foldedDetailFor(ESLINT_GIVES)).not.toHaveClass("hidden");
	});

	it("marks pipeline rows with a neutral dot instead of a status badge", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getAllByRole("img", { name: "skipped" }).length
		).toBeGreaterThan(0);
		expect(screen.queryByText("RUN")).not.toBeInTheDocument();
	});

	it("counts the used spots in the pipeline subtitle", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("2 of 4 spots used")).toBeInTheDocument();
	});

	it("leaves Gate modifiers out — the pipeline rows carry the rewards", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText("Gate modifiers")).not.toBeInTheDocument();
	});

	it("labels a pipeline row's reward in green, with no demand mark left (ADR-035)", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText("!")).not.toBeInTheDocument();
		expect(screen.getAllByText("v").length).toBeGreaterThan(0);
		expect(screen.getByText("+32KB").parentElement).toHaveClass("text-celadon");
	});

	it("renders the bench offers", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("slots a clicked bench config", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onSlot).toHaveBeenCalledWith("eslint");
	});

	it("removes a non-fixed slotted config", () => {
		const onUnslot = vi.fn();
		render(<ConfiguringScreen {...base} onUnslot={onUnslot} />);
		fireEvent.click(screen.getByRole("button", { name: /Remove \.js/ }));
		expect(onUnslot).toHaveBeenCalledWith("js");
	});

	it("previews a hovered bench config in the next open slot", () => {
		render(<ConfiguringScreen {...base} spotsUsed={3} spotsFree={1} />);
		expect(screen.getByText("empty slot")).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));
		expect(
			screen.getByRole("button", { name: "Add AGENTS.md to your pipeline" })
		).toBeInTheDocument();
		expect(screen.queryByText("click to add")).not.toBeInTheDocument();
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("keeps the preview alive while the pointer travels from chip to row", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		const chip = screen.getByRole("button", { name: /AGENTS.md/ });
		fireEvent.mouseOver(chip);
		fireEvent.mouseLeave(chip);
		fireEvent.click(
			screen.getByRole("button", { name: /^Add .+ to your pipeline$/ })
		);
		expect(onSlot).toHaveBeenCalledWith("agents-md");
	});

	it("switches the preview when another bench config is hovered", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));
		fireEvent.mouseOver(screen.getByRole("button", { name: /ESLint/ }));
		expect(
			screen.getAllByRole("button", { name: /^Add .+ to your pipeline$/ })
		).toHaveLength(1);
		expect(screen.queryByText(/All coverage earns/)).not.toBeInTheDocument();
	});

	it("drops the preview once its config is committed", () => {
		render(<ConfiguringScreen {...base} />);
		const chip = screen.getByRole("button", { name: /AGENTS.md/ });
		fireEvent.mouseOver(chip);
		fireEvent.click(chip);
		expect(
			screen.queryByRole("button", { name: /^Add .+ to your pipeline$/ })
		).not.toBeInTheDocument();
	});

	it("commits the previewed config when its row is clicked", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));
		fireEvent.click(
			screen.getByRole("button", { name: /^Add .+ to your pipeline$/ })
		);
		expect(onSlot).toHaveBeenCalledWith("agents-md");
	});

	it("keys no grade at all, on the rows or under them", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));

		expect(screen.queryByText("byte")).not.toBeInTheDocument();
		expect(screen.queryByText("bit")).not.toBeInTheDocument();
	});
});

describe("stack mode (ADR-026)", () => {
	const stackBase = {
		...base,
		configs: [],
		stacks: STARTER_STACKS,
		onPickStack: vi.fn(),
	};

	it("offers one radio row per stack", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.getAllByRole("radio")).toHaveLength(STARTER_STACKS.length);
	});

	it("picks a stack when its row is clicked", () => {
		const onPickStack = vi.fn();
		render(<ConfiguringScreen {...stackBase} onPickStack={onPickStack} />);
		fireEvent.click(screen.getByRole("radio", { name: /Gamble/ }));
		expect(onPickStack).toHaveBeenCalledWith("ship-it");
	});

	it("reads the stack the pipeline already holds as the checked one", () => {
		const shipIt = starterStackFor("ship-it");
		if (!shipIt) throw new Error("ship-it stack missing");
		render(<ConfiguringScreen {...stackBase} configs={shipIt.configs} />);
		expect(screen.getByRole("radio", { name: /Gamble/ })).toBeChecked();
		expect(screen.getByRole("radio", { name: /Safe start/ })).not.toBeChecked();
	});

	it("replaces the bench and pipeline with the one stack decision", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.getByText("Pick your build")).toBeInTheDocument();
		expect(
			screen.queryByText("Click a config to add it to your pipeline")
		).not.toBeInTheDocument();
		expect(screen.queryByText("Your pipeline")).not.toBeInTheDocument();
	});

	it("shows the same receipt as the classic screen — no separate variant", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.getByText(/5 polls/)).toBeInTheDocument();
		expect(screen.getByText("Gate cleared")).toBeInTheDocument();
		expect(
			screen.getByText(/Miss the target: the gate peels/)
		).toBeInTheDocument();
	});

	it("carries the start action inside the build summary, not the screen footer", () => {
		const onClick = vi.fn();
		render(
			<ConfiguringScreen
				{...stackBase}
				startAction={{ label: "Start run →", onClick }}
			/>
		);
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		fireEvent.click(receipt.getByRole("button", { name: "Start run →" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("carries no fatal wording — the opening build cannot be emptied by one peel", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(
			screen.getByText(/Miss the target: the gate peels/)
		).toBeInTheDocument();
		expect(screen.queryByText(/ends the run/)).not.toBeInTheDocument();
	});

	it("stays on the classic bench screen when no stacks are offered", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText("Pick your build")).not.toBeInTheDocument();
		expect(
			screen.getByText("Click a config to add it to your pipeline")
		).toBeInTheDocument();
	});

	it("expands the picked stack into its trimmed preview — payoff and dot", () => {
		const testEverything = starterStackFor("test-everything");
		if (!testEverything) throw new Error("test-everything stack missing");
		render(
			<ConfiguringScreen {...stackBase} configs={testEverything.configs} />
		);
		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent === "JavaScript polls reward ×1.25 coverage"
			)
		).toBeInTheDocument();
		expect(screen.queryByText("0/1")).not.toBeInTheDocument();
		expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
	});

	it("keeps a linter's fee behind its own details tap — the expanded config's mechanics", () => {
		const testEverything = starterStackFor("test-everything");
		if (!testEverything) throw new Error("test-everything stack missing");
		render(
			<ConfiguringScreen {...stackBase} configs={testEverything.configs} />
		);
		expect(screen.queryByText(CONFIGS.eslint.costs)).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /more details/ }));
		expect(screen.getByText(CONFIGS.eslint.costs)).toBeInTheDocument();
	});

	it("keeps unpicked stacks as plain chips — no pipeline to show yet", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.queryByText("1 correct answer")).not.toBeInTheDocument();
	});

	it("opens the full bench from the Customize row", () => {
		render(<ConfiguringScreen {...stackBase} />);
		fireEvent.click(
			screen.getByRole("button", { name: /Customize all 4 spots/ })
		);
		expect(
			screen.getByText("Click a config to add it to your pipeline")
		).toBeInTheDocument();
		expect(screen.queryByText("Pick your build")).not.toBeInTheDocument();
	});

	it("walks back from the bench to the stacks", () => {
		render(<ConfiguringScreen {...stackBase} />);
		fireEvent.click(
			screen.getByRole("button", { name: /Customize all 4 spots/ })
		);
		fireEvent.click(screen.getByRole("button", { name: /Back to stacks/ }));
		expect(screen.getByText("Pick your build")).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(STARTER_STACKS.length);
	});

	it("keeps the bench free of the stacks detour when no stacks were offered", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.queryByRole("button", { name: /Back to stacks/ })
		).not.toBeInTheDocument();
	});

	it("says nothing about width while the build simply has room left", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.queryByText("To start")).not.toBeInTheDocument();
	});

	it("names the overflow when a repossessed rung leaves the build too wide", () => {
		render(<ConfiguringScreen {...stackBase} overflowSpots={3} />);
		expect(screen.getByText("To start")).toBeInTheDocument();
		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "SPAN" &&
					element.textContent ===
						"Over capacity by 3 spots — minify, uninstall, or rent more room"
			)
		).toBeInTheDocument();
	});
});
