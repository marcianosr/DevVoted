import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { GateStake } from "~/modules/run/run/application/runView.viewmodel";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const stake = createMockGateStake({
	gateNumber: 1,
	modifiers: {
		gateReward: 32,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	perAnswer: {
		coveragePerCorrect: 1,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
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
		expect(screen.getByText("Gate cleared")).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toHaveClass("text-gradient-green");
		expect(screen.queryByText("×1")).not.toBeInTheDocument();
	});

	// The row used to promise "+1% coverage" while a build with a Focus config and
	// a streak actually paid 1.4% on the first answer (ADR-040). The base alone is
	// a number nobody ever sees, so both multipliers are stated beside it.
	it("names the multipliers that ride on a correct answer", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({
					perAnswer: {
						coveragePerCorrect: 1,
						storageKbPerCorrect: 0,
						matchingConfigMultiplier: 1.25,
						streakStepMultiplier: 1.1,
					},
				})}
			/>
		);
		expect(screen.getByText(/on a matching poll/)).toHaveTextContent(
			"×1.25 on a matching poll · ×1.1 per streak step"
		);
	});

	it("still states the streak step with no Focus config in the build", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText(/per streak step/)).toHaveTextContent(
			"×1.1 per streak step"
		);
		expect(screen.queryByText(/matching poll/)).not.toBeInTheDocument();
	});

	it("previews the gate's own swatch, unearned until the gate hands it over", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText("Swatch earned")).toBeInTheDocument();
		expect(screen.getByText("Boulder Swatch")).toHaveClass("text-pewter");
	});

	it("lists the window and the gate's own coverage demand as the two things a clear takes", () => {
		render(<PrepScreen {...base} stake={stakeWith({ pollsPerGate: 5 })} />);
		const requirements = screen.getAllByRole("listitem");
		expect(requirements[0]).toHaveTextContent("Answer all 5 polls");
		expect(requirements[1]).toHaveTextContent("Earn 3% coverage this gate");
	});

	it("grades the demand against the attempt's own meter", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ coverageDemand: 12, coverageHeld: 4 })}
			/>
		);
		expect(screen.getByText("12% coverage this gate")).toBeInTheDocument();
		expect(screen.getByText("4% / 12%")).toHaveClass("text-cinnabar");
	});

	it("rails the meter against the demand, so the gap is legible at a glance", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({
					gateNumber: 1,
					coverageDemand: 12,
					coverageHeld: 6,
				})}
			/>
		);
		const rail = screen.getByRole("progressbar", {
			name: "coverage toward gate 1",
		});
		expect(rail).toHaveAttribute("aria-valuenow", "6");
		expect(rail).toHaveAttribute("aria-valuemax", "12");
	});

	it("turns the coverage progress green once the demand is met", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ coverageDemand: 12, coverageHeld: 12 })}
			/>
		);
		expect(screen.getByText("12% / 12%")).toHaveClass("text-viridian");
	});

	it("keeps the stake in plain language, no pipeline jargon", () => {
		render(<PrepScreen {...base} />);
		expect(screen.queryByText(/Clear your pipeline/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/satisfy your config checks/)
		).not.toBeInTheDocument();
	});

	it("states the peel and the loop it drops you into as the miss cost (ADR-037)", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ pollsPerGate: 5, stripsOnFailure: 1 })}
			/>
		);
		expect(
			screen.getByText(/Miss the target: the gate peels/)
		).toHaveTextContent(
			"the gate peels 1 config, then you shop and run it again on 5 fresh polls"
		);
		expect(screen.queryByText(/ends the run/)).not.toBeInTheDocument();
	});

	it("warns that a miss ends the run once the peel takes the whole build", () => {
		render(
			<PrepScreen
				{...base}
				stake={stakeWith({ stripsOnFailure: 1, missIsFatal: true })}
			/>
		);
		expect(
			screen.getByText(/That peel takes your whole pipeline/)
		).toHaveTextContent("a miss here ends the run");
	});

	it("names the storage plan's bill on a paid tier", () => {
		render(<PrepScreen {...base} stake={stakeWith({ billKb: 8 })} />);
		expect(screen.getByText("Storage bill")).toBeInTheDocument();
		expect(screen.getByText("−8KB")).toHaveClass("text-cinnabar");
		expect(screen.getByText(/pass or fail/)).toBeInTheDocument();
	});

	it("keeps the free tier's receipt bill-free", () => {
		render(<PrepScreen {...base} />);
		expect(screen.queryByText("Storage bill")).not.toBeInTheDocument();
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

	describe("the doorstep drop", () => {
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

		it("refuses the drop of a last config — a pipeline never goes bare", () => {
			render(<PrepScreen {...base} configs={[CONFIGS.js]} atMinimumWidth />);
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
				configs={[]}
				stake={stakeWith({ gateNumber: 4 })}
				shopAction={{ label: "← Back to shop", onClick }}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "← Back to shop" }));
		expect(onClick).toHaveBeenCalledTimes(1);
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
