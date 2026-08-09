import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	gatesCleared: 0,
	pollsPerGate: 5,
	stripsOnFailure: 1,
	modifiers: {
		gateReward: 80,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	configs: [CONFIGS.unitTests, CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.agentsMd],
	checks: [
		{
			label: "Correct",
			progress: "0/1",
			current: 0,
			target: 1,
			state: "running" as const,
			sourceConfigId: "unit-tests",
			description: "1 correct answer",
		},
	],
	onSlot: vi.fn(),
	onUnslot: vi.fn(),
};

describe(ConfiguringScreen, () => {
	it("names the first gate — no separate prep screen for gate 0", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
	});

	it("lists the gate's rewards and fail stake as their own rows", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getAllByText("polls this window", { exact: false }).length
		).toBeGreaterThan(0);
		expect(
			screen.getByRole("heading", { name: "Rewards" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Penalty" })
		).toBeInTheDocument();
		expect(screen.getByText("+80KB")).toHaveClass("text-gradient-green");
		expect(screen.getByText("×1")).toHaveClass("text-gradient-green");
		expect(screen.getByText("strip 1 config")).toHaveClass("text-cinnabar");
	});

	it("captions the gate with its coverage multiplier", () => {
		render(
			<ConfiguringScreen
				{...base}
				modifiers={{ ...base.modifiers, coverageMultiplier: 2, coverageAdd: 5 }}
			/>
		);
		expect(screen.getByText("×2 +5%")).toHaveClass("text-gradient-green");
	});

	it("states the window's objectives on the receipt", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: "Objectives" })
		).toBeInTheDocument();
		expect(screen.getByText("Make your pipeline succeed")).toBeInTheDocument();
		expect(screen.getByText("Answer 5 polls this window")).toBeInTheDocument();
	});

	it("names the stake fatal once a fail would take the whole build", () => {
		render(
			<ConfiguringScreen {...base} stripsOnFailure={2} configs={base.configs} />
		);
		expect(screen.getByText("strip all — run over")).toBeInTheDocument();
	});

	it("previews the clear reward a hovered bench config would add, old to new", () => {
		render(
			<ConfiguringScreen
				{...base}
				configs={[CONFIGS.js]}
				modifiers={{ ...base.modifiers, gateReward: 32 }}
				bench={[CONFIGS.unitTests]}
			/>
		);
		fireEvent.mouseOver(screen.getByRole("button", { name: "Unit Tests" }));
		// Scoped to the receipt — Unit Tests' own previewed pipeline row also
		// prints "+32KB" (its gives text), which would otherwise collide.
		const receipt = within(screen.getByTestId("gate-stake-receipt"));
		// Unit Tests' +32KB storageOnClear stacks onto the base 32KB reward.
		expect(receipt.getByText("+32KB")).toHaveClass("text-zinc-400");
		expect(receipt.getByText("→ +64KB")).toHaveClass("text-celadon");
	});

	it("renders the bench and pipeline columns side by side", () => {
		render(<ConfiguringScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: "Starter configs" })
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
			screen.getByText("More slots will unlock when you gain coverage!")
		).toBeInTheDocument();
		expect(screen.queryByText(/reached/)).not.toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
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
		expect(
			screen.queryByText(/More slots will unlock/)
		).not.toBeInTheDocument();
	});

	// Wide screens open every row; a phone shuts them all and shows the caret.
	// The detail stays mounted either way, so the fold is a class, not a mount.
	// The FactRow wraps each fact in its own label+value line, so the
	// fold-controlled ancestor sits three levels up: value → FactRow → the
	// requirement/effect/progress group → the detail span itself.
	const foldedDetailFor = (text: string) =>
		screen.getByText(text).parentElement?.parentElement?.parentElement;

	it("opens each row's demand and effect by default, above the fold breakpoint", () => {
		render(<ConfiguringScreen {...base} />);
		expect(foldedDetailFor("1 correct answer")).toHaveClass(
			"hidden",
			"sm:flex"
		);
		expect(screen.getByText("+32KB")).toBeInTheDocument();
	});

	it("folds a row to one line when its name is tapped", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.click(screen.getByRole("button", { name: "Unit Tests" }));
		const detail = foldedDetailFor("1 correct answer");
		expect(detail).toHaveClass("hidden");
		expect(detail).not.toHaveClass("sm:flex");
	});

	it("folds a tapped-shut row back open on the next tap", () => {
		render(<ConfiguringScreen {...base} />);
		const name = screen.getByRole("button", { name: "Unit Tests" });
		fireEvent.click(name);
		fireEvent.click(name);
		expect(foldedDetailFor("1 correct answer")).toHaveClass("flex");
		expect(foldedDetailFor("1 correct answer")).not.toHaveClass("hidden");
	});

	it("marks pipeline rows with a state dot instead of a status badge", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByRole("img", { name: "running" })).toBeInTheDocument();
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

	it("labels a pipeline row's check and reward, red and green", () => {
		render(<ConfiguringScreen {...base} />);
		// Both installed configs carry a check here (Unit Tests' check,
		// .js's focus demand), so the label itself is not unique — the row's
		// value is.
		expect(screen.getAllByText("Check").length).toBeGreaterThan(0);
		expect(screen.getByText("1 correct answer")).toHaveClass("text-cinnabar");
		expect(screen.getAllByText("Reward").length).toBeGreaterThan(0);
		// "+32KB" is itself wrapped in a bold highlight span (emphasizeNumbers) —
		// the tone class lives on its enclosing paragraph.
		expect(screen.getByText("+32KB").parentElement).toHaveClass(
			"text-viridian"
		);
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
