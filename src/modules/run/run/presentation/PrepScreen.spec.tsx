import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { GateStake } from "~/modules/run/run/application/runView.viewmodel";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const stake = createMockGateStake({
	gateNumber: 1,
	minConfigs: 1,
	modifiers: {
		gateReward: 32,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	perAnswer: {
		coveragePerCorrect: 1,
		storageKbPerCorrect: 0,
	},
});

const stakeWith = (overrides: Partial<GateStake>): GateStake => ({
	...stake,
	...overrides,
});

const base = {
	stake,
	configs: [CONFIGS.js, CONFIGS.eslint],
	atMinimumWidth: false,
	onStartGate: vi.fn(),
	onDropConfig: vi.fn(),
};

describe(PrepScreen, () => {
	it("names the gate", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText("Boulder gate")).toBeInTheDocument();
	});

	it("falls back to a plain number past the swatch roster", () => {
		render(<PrepScreen {...base} stake={stakeWith({ gateNumber: 99 })} />);
		expect(screen.getByText("Gate 99 gate")).toBeInTheDocument();
	});

	it("shows the polls-per-window subcaption", () => {
		render(<PrepScreen {...base} stake={stakeWith({ pollsPerGate: 5 })} />);
		expect(screen.getByText(/5 polls/)).toBeInTheDocument();
	});

	it("shows the gate's storage reward, not a trivial coverage multiplier", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText("Succeed your build:")).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toHaveClass("text-gradient-green");
		expect(screen.queryByText("×1")).not.toBeInTheDocument();
	});

	it("captions the gate with its coverage multiplier", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({
					modifiers: {
						...stake.modifiers,
						coverageMultiplier: 2,
						coverageAdd: 5,
					},
				})}
			/>
		);
		expect(screen.getByText("×2 +5% coverage this gate")).toHaveClass(
			"text-gradient-green"
		);
	});

	it("keeps the stake in plain language, no pipeline jargon", () => {
		render(<PrepScreen {...base} />);
		expect(screen.queryByText(/Clear your pipeline/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/satisfy your config checks/)
		).not.toBeInTheDocument();
	});

	it("states the stake as a plain count when it is not fatal", () => {
		render(<PrepScreen {...base} stake={stakeWith({ stripsOnFailure: 1 })} />);
		expect(screen.getByText("Remove 1 config")).toHaveClass("text-cinnabar");
	});

	it("pluralizes the stake for more than one config", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ stripsOnFailure: 2 })}
				configs={[CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd]}
			/>
		);
		expect(screen.getByText("Remove 2 configs")).toBeInTheDocument();
	});

	it("warns the run is over once the stake would take the whole build", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ stripsOnFailure: 2 })}
				configs={base.configs}
			/>
		);
		expect(
			screen.getByText("All configs disabled — run over")
		).toBeInTheDocument();
	});

	it("names the storage plan's bill on a paid tier", () => {
		render(<PrepScreen {...base} stake={stakeWith({ billKb: 8 })} />);
		expect(screen.getByText("−8KB")).toHaveClass("text-cinnabar");
		expect(screen.getByText(/storage bill — pass or fail/)).toBeInTheDocument();
	});

	it("keeps the free tier's receipt bill-free", () => {
		render(<PrepScreen {...base} />);
		expect(
			screen.queryByText(/storage bill — pass or fail/)
		).not.toBeInTheDocument();
	});

	it("marks the gate name with its swatch colour", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByTestId("swatch")).toBeInTheDocument();
	});

	it("lists the installed configs", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	describe("the doorstep drop (ADR-027)", () => {
		const droppable = { ...base, configs: [CONFIGS.js, CONFIGS.eslint] };

		it("drops the config the player confirms, naming it on the button", () => {
			const onDropConfig = vi.fn();
			render(<PrepScreen {...droppable} onDropConfig={onDropConfig} />);
			fireEvent.click(screen.getByRole("button", { name: /^\.js/ }));
			fireEvent.click(screen.getByRole("button", { name: "Drop .js" }));
			expect(onDropConfig).toHaveBeenCalledWith("js");
		});

		it("asks for a second click, so one stray click never sheds a config", () => {
			const onDropConfig = vi.fn();
			render(<PrepScreen {...droppable} onDropConfig={onDropConfig} />);
			fireEvent.click(screen.getByRole("button", { name: /^\.js/ }));
			expect(onDropConfig).not.toHaveBeenCalled();
		});

		it("warns that dropping refunds nothing while the shop is still open", () => {
			render(
				<PrepScreen
					{...droppable}
					shopAction={{ label: "← Back to shop", onClick: vi.fn() }}
				/>
			);
			fireEvent.click(screen.getByRole("button", { name: /^\.js/ }));
			expect(
				screen.getByText(/Uninstall it in the shop to bank the refund/)
			).toBeInTheDocument();
		});

		it("says the shop is closed once prep sits behind the gate door", () => {
			render(<PrepScreen {...droppable} />);
			fireEvent.click(screen.getByRole("button", { name: /^\.js/ }));
			expect(
				screen.getByText(/the shop is closed until the next gate/)
			).toBeInTheDocument();
		});

		it("refuses every drop at the gate's width demand, naming the demand", () => {
			render(
				<PrepScreen
					{...droppable}
					stake={stakeWith({ minConfigs: 2, gateNumber: 4 })}
					atMinimumWidth
				/>
			);
			expect(
				screen.queryByRole("button", { name: /^\.js/ })
			).not.toBeInTheDocument();
			expect(
				screen.getAllByText(
					"Gate 4 demands 2 configs — dropping would sink the build below it."
				)
			).toHaveLength(droppable.configs.length);
		});

		it("refuses the drop of a last config even where the gate demands none", () => {
			render(
				<PrepScreen
					{...base}
					stake={stakeWith({ minConfigs: 0 })}
					configs={[CONFIGS.js]}
					atMinimumWidth
				/>
			);
			expect(
				screen.queryByRole("button", { name: /^\.js/ })
			).not.toBeInTheDocument();
			expect(
				screen.getByText(
					"Your only config — dropping it would leave nothing to clear a gate with."
				)
			).toBeInTheDocument();
		});
	});

	it("mentions the gate's width demand in the build summary", () => {
		render(<PrepScreen {...base} stake={stakeWith({ minConfigs: 2 })} />);
		expect(screen.getByText(/2\+ configs/)).toBeInTheDocument();
	});

	it("names the shortfall in cinnabar while the build sits under the demand", () => {
		render(<PrepScreen {...base} stake={stakeWith({ minConfigs: 3 })} />);
		expect(
			screen.getByText(
				"Demands 3 configs — the build holds 2. Install 1 more to climb on."
			)
		).toHaveClass("text-cinnabar");
	});

	it("names the start action after the gate and fires onStartGate when clicked", () => {
		const onStartGate = vi.fn();
		render(<PrepScreen {...base} onStartGate={onStartGate} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Start Boulder gate →" })
		);
		expect(onStartGate).toHaveBeenCalledTimes(1);
	});

	it("offers the back-to-shop shortcut beside the stake while the shop is open", () => {
		const onClick = vi.fn();
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ minConfigs: 2 })}
				shopAction={{ label: "← Back to shop", onClick }}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "← Back to shop" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("leaves the shortcut out when no shop sits behind prep", () => {
		render(<PrepScreen {...base} stake={stakeWith({ minConfigs: 2 })} />);
		expect(
			screen.queryByRole("button", { name: "← Back to shop" })
		).not.toBeInTheDocument();
	});

	it("locks the start button behind the wait copy until the next polls open", () => {
		const onStartGate = vi.fn();
		render(
			<PrepScreen
				{...base}
				startLock="New polls in 7h 23m"
				onStartGate={onStartGate}
			/>
		);
		const locked = screen.getByRole("button", { name: "New polls in 7h 23m" });
		expect(locked).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /Start .* gate/ })
		).not.toBeInTheDocument();
	});
});
