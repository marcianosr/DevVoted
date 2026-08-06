import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
	slots: 3,
	bench: [CONFIGS.eslint, CONFIGS.copilot],
	gateReward: 80,
	rewardMultiplier: 1,
	coverageMultiplier: 1,
	coverageAdd: 0,
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

	it("shows the next swatch locked, with live unlock progress", () => {
		render(
			<ConfiguringScreen {...base} coverage={6.5} slotCoverageRequired={11} />
		);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText(/· slot 4 · opens gate 1/)).toBeInTheDocument();
		expect(screen.getByText("11%")).toBeInTheDocument();
		expect(screen.getByText("6.5%")).toBeInTheDocument();
		expect(screen.getByText("locked")).toBeInTheDocument();
		expect(
			screen.getByRole("progressbar", {
				name: "coverage toward Boulder Swatch",
			})
		).toBeInTheDocument();
	});

	it("marks the next swatch unlocked once coverage meets its gate", () => {
		render(
			<ConfiguringScreen {...base} coverage={12} slotCoverageRequired={11} />
		);
		expect(screen.getByText("unlocked")).toBeInTheDocument();
	});

	it("hides the swatch row at the slot cap", () => {
		render(
			<ConfiguringScreen
				{...base}
				coverage={12}
				slotCoverageRequired={Infinity}
			/>
		);
		// The collected chips still list Pallet; it is the unlock row that goes.
		expect(screen.queryByText(/opens gate/)).not.toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("opens each row's demand and effect by default", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("1 correct answer")).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toBeInTheDocument();
	});

	it("folds a row to one line when its name is tapped", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.click(screen.getByRole("button", { name: "Unit Tests" }));
		expect(screen.queryByText("1 correct answer")).not.toBeInTheDocument();
	});

	it("folds a tapped-shut row back open on the next tap", () => {
		render(<ConfiguringScreen {...base} />);
		const name = screen.getByRole("button", { name: "Unit Tests" });
		fireEvent.click(name);
		fireEvent.click(name);
		expect(screen.getByText("1 correct answer")).toBeInTheDocument();
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

	it("shows the gate reward and multipliers", () => {
		render(<ConfiguringScreen {...base} />);
		expect(screen.getByText("+80KB")).toBeInTheDocument();
		expect(screen.getAllByText("×1")).toHaveLength(2);
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
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		expect(screen.getByText("click to add")).toBeInTheDocument();
		// The preview occupies the would-be slot, so no open slot remains.
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("keeps the preview alive while the pointer travels from chip to row", () => {
		// Clearing on mouseleave would unmount the row before it can be
		// clicked — the preview only yields to another hover or a commit.
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		const chip = screen.getByRole("button", { name: /Copilot/ });
		fireEvent.mouseOver(chip);
		fireEvent.mouseLeave(chip);
		fireEvent.click(screen.getByRole("button", { name: /click to add/ }));
		expect(onSlot).toHaveBeenCalledWith("copilot");
	});

	it("switches the preview when another bench config is hovered", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		fireEvent.mouseOver(screen.getByRole("button", { name: /ESLint/ }));
		const previews = screen.getAllByText("click to add");
		expect(previews).toHaveLength(1);
		expect(screen.queryByText(/All coverage earns/)).not.toBeInTheDocument();
	});

	it("drops the preview once its config is committed", () => {
		render(<ConfiguringScreen {...base} />);
		// Grab the chip before hovering — the preview row also answers to /Copilot/.
		const chip = screen.getByRole("button", { name: /Copilot/ });
		fireEvent.mouseOver(chip);
		fireEvent.click(chip);
		expect(screen.queryByText("click to add")).not.toBeInTheDocument();
	});

	it("shows the modifier change the previewed config would make, old to new", () => {
		render(<ConfiguringScreen {...base} />);
		// Copilot doubles coverage: every ×1 on the strip reads muted (the old
		// coverage value and the untouched reward ×), and → ×2 arrives in celadon.
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		for (const identity of screen.getAllByText("×1")) {
			expect(identity).toHaveClass("text-zinc-500");
		}
		expect(screen.getByText("→ ×2")).toHaveClass("text-celadon");
	});

	it("keeps unchanged stats plain while previewing", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		// Copilot touches neither the gate reward nor the reward multiplier.
		expect(screen.getByText("+80KB")).toBeInTheDocument();
		expect(screen.queryByText(/→ \+80KB/)).not.toBeInTheDocument();
	});

	it("commits the previewed config when its row is clicked", () => {
		const onSlot = vi.fn();
		render(<ConfiguringScreen {...base} onSlot={onSlot} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		fireEvent.click(screen.getByRole("button", { name: /click to add/ }));
		expect(onSlot).toHaveBeenCalledWith("copilot");
	});

	it("names each pipeline row's rarity", () => {
		render(<ConfiguringScreen {...base} />);
		fireEvent.mouseOver(screen.getByRole("button", { name: /Copilot/ }));
		// Once for the legend entry, once for the preview row's heading.
		expect(screen.getAllByText("legendary")).toHaveLength(2);
	});
});
