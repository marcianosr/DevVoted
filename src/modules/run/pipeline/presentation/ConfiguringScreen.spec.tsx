import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	STARTER_STACKS,
	starterStackFor,
} from "~/modules/run/config/domain/stack.model";
import { MAX_SLOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import { ConfiguringScreen } from "~/modules/run/pipeline/presentation/ConfiguringScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const base = {
	// This screen only renders on a fresh run (`configuring` is set in createRun
	// alone), so the gate is always 0 — which demands no width.
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
	slots: 3,
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
		// Scoped to the receipt — Unit Tests' own previewed pipeline row also
		// prints "+32KB" (its gives text), which would otherwise collide.
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		// Unit Tests' +32KB storageOnClear stacks onto the base 32KB reward.
		expect(receipt.getByText("+32KB")).toHaveClass("text-pewter");
		expect(receipt.getByText("→ +64KB")).toHaveClass("text-celadon");
	});

	it("renders the bench and pipeline columns side by side", () => {
		render(<ConfiguringScreen {...base} />);
		// The bench aside carries no heading anymore — its instruction line is
		// what identifies it.
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
				onSlot={onSlot}
			/>
		);
		const chip = screen.getByRole("button", { name: /ESLint/ });
		expect(chip).toBeDisabled();
		fireEvent.click(chip);
		expect(onSlot).not.toHaveBeenCalled();
	});

	it("promises more slots instead of showing an unclaimable unlock rung", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByText(
				"More slots unlock as you clear gates and as your coverage climbs."
			)
		).toBeInTheDocument();
		expect(screen.queryByText(/reached/)).not.toBeInTheDocument();
		// The one rail on screen is the gate's coverage demand, not a slot rung.
		expect(screen.getByRole("progressbar")).toHaveAccessibleName(
			"coverage toward gate 0"
		);
	});

	it("numbers only the slots the pipeline actually has", () => {
		render(<ConfiguringScreen {...base} />);
		// base fills two of three slots, so: 1-2 filled, 3 empty, and no fourth row.
		// Scoped to the row numbering itself — the stake block above also shows a
		// bare number, and can collide with a slot digit.
		for (const slot of ["1", "2", "3"])
			expect(
				screen.getByText(slot, { selector: ".tabular-nums" })
			).toBeInTheDocument();
		expect(
			screen.queryByText("4", { selector: ".tabular-nums" })
		).not.toBeInTheDocument();
	});

	it("drops the slot promise at the slot cap", () => {
		render(<ConfiguringScreen {...base} slots={MAX_SLOTS} />);
		expect(screen.queryByText(/More slots unlock/)).not.toBeInTheDocument();
	});

	// Wide screens open every row; a phone shuts them all and shows the caret.
	// The detail stays mounted either way, so the fold is a class, not a mount.
	// The FactRow wraps each fact in its own label+value line, so the
	// fold-controlled ancestor sits three levels up: value → FactRow → the
	// requirement/effect/progress group → the detail span itself.
	const foldedDetailFor = (text: string) =>
		screen.getByText(text).parentElement?.parentElement?.parentElement;

	// ESLint's gives line has no number token, so it survives emphasizeNumbers
	// as one text node — the fold tests read their target off it.
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

	it("counts the used slots in the pipeline subtitle", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("2 of 3 slots used")).toBeInTheDocument();
	});

	it("leaves Gate modifiers out — the pipeline rows carry the rewards", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText("Gate modifiers")).not.toBeInTheDocument();
	});

	it("labels a pipeline row's reward in green, with no demand mark left (ADR-035)", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.queryByText("!")).not.toBeInTheDocument();
		expect(screen.getAllByText("v").length).toBeGreaterThan(0);
		// "+32KB" is itself wrapped in a bold highlight span (emphasizeNumbers) —
		// the tone class lives on its enclosing paragraph.
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
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("empty slot")).toBeInTheDocument();
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));
		// The row itself is the affordance — no "click to add" text inside the
		// pipeline, which read as if the config were already installed.
		expect(
			screen.getByRole("button", { name: "Add AGENTS.md to your pipeline" })
		).toBeInTheDocument();
		expect(screen.queryByText("click to add")).not.toBeInTheDocument();
		// The preview occupies the would-be slot, so no open slot remains.
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("keeps the preview alive while the pointer travels from chip to row", () => {
		// Clearing on mouseleave would unmount the row before it can be
		// clicked — the preview only yields to another hover or a commit.
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
		// Grab the chip before hovering — the preview row also answers to /AGENTS.md/.
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

	it("keeps rarity to the bench legend — the rows carry it in their border", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /AGENTS.md/ }));
		// The word appears once, in the legend: naming it per row added nothing.
		expect(screen.getAllByText("legendary")).toHaveLength(1);
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
		// The gives text bolds its number in a nested span (emphasizeNumbers), so
		// a plain string match won't see across the element boundary — match on
		// the full concatenated text instead.
		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent === "JavaScript polls reward ×1.25 coverage"
			)
		).toBeInTheDocument();
		// No window has been played on this screen — the live counter is absent,
		// not just hidden (Marciano, 2026-08-10) — but each config's status dot
		// is back, the same one RoleList shows (Marciano, 2026-08-11).
		expect(screen.queryByText("0/1")).not.toBeInTheDocument();
		expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
	});

	it("keeps a linter's fee behind its own details tap — the expanded config's mechanics", () => {
		const testEverything = starterStackFor("test-everything");
		if (!testEverything) throw new Error("test-everything stack missing");
		render(
			<ConfiguringScreen {...stackBase} configs={testEverything.configs} />
		);
		expect(
			screen.queryByText("The fee doubles each use")
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /more details/ }));
		expect(screen.getByText("The fee doubles each use")).toBeInTheDocument();
	});

	it("keeps unpicked stacks as plain chips — no pipeline to show yet", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.queryByText("1 correct answer")).not.toBeInTheDocument();
	});

	it("opens the full bench from the Customize row", () => {
		render(<ConfiguringScreen {...stackBase} />);
		fireEvent.click(
			screen.getByRole("button", { name: /Customize all 3 slots/ })
		);
		expect(
			screen.getByText("Click a config to add it to your pipeline")
		).toBeInTheDocument();
		expect(screen.queryByText("Pick your build")).not.toBeInTheDocument();
	});

	it("walks back from the bench to the stacks", () => {
		render(<ConfiguringScreen {...stackBase} />);
		fireEvent.click(
			screen.getByRole("button", { name: /Customize all 3 slots/ })
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

	it("shows how many configs the pipeline still needs before any stack is picked", () => {
		render(<ConfiguringScreen {...stackBase} />);
		expect(screen.getByText("To start")).toBeInTheDocument();
		// The count sits in its own bold span, so match on the concatenated text —
		// scoped to the span itself, since its parent section shares the same text.
		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "SPAN" &&
					element.textContent === "Needs at least 3 configs in your pipeline"
			)
		).toBeInTheDocument();
	});

	it("drops the install count once a picked stack fills every slot", () => {
		const shipIt = starterStackFor("ship-it");
		if (!shipIt) throw new Error("ship-it stack missing");
		render(<ConfiguringScreen {...stackBase} configs={shipIt.configs} />);
		expect(screen.queryByText("To start")).not.toBeInTheDocument();
		expect(screen.queryByText(/in your pipeline/)).not.toBeInTheDocument();
	});
});
