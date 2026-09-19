import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { RunOverView, runOverFrameOf } from "./RunOverView.component";

const deadView = () =>
	createMockRunView({
		status: "dead",
		gatesCleared: 4,
		configs: [CONFIGS.js, CONFIGS.cache],
		swatchGates: [0, 1],
		storage: 256,
		upkeepPaidKb: 64,
		gateStake: createMockGateStake({
			gateNumber: 4,
			coverageLadder: { floor: 34, ok: 42, healthy: 50 },
			coverageHeld: 22,
			unitsHeld: 5.5,
		}),
	});

describe("runOverFrameOf", () => {
	it("stops the report on the gate that shut, not on the one the run cleared", () => {
		expect(runOverFrameOf(deadView()).gate).toBe(4);
	});

	it("reports a summit at the victory gate, however the stake reads", () => {
		const frame = runOverFrameOf(
			createMockRunView({ status: "won", victoryGate: 12 })
		);

		expect(frame.won).toBe(true);
		expect(frame.gate).toBe(12);
	});

	it("clamps a dead run's bar under the floor, so the band cannot disagree", () => {
		const { bar } = runOverFrameOf(deadView());

		expect(bar.held).toBeLessThan(bar.floor);
	});

	it("leaves the account archive out unless a caller knows it", () => {
		expect(runOverFrameOf(deadView()).archiveAfterKb).toBeUndefined();
		expect(runOverFrameOf(deadView(), 8_400).archiveAfterKb).toBe(8_400);
	});
});

describe("RunOverView", () => {
	it("hands the new-run press to its caller", async () => {
		const onNewRun = vi.fn();

		render(<RunOverView view={deadView()} onNewRun={onNewRun} />);

		await userEvent.click(
			screen.getByRole("button", { name: "Start new run" })
		);

		expect(onNewRun).toHaveBeenCalledOnce();
	});

	it("refuses the community door when nothing is listening behind it", () => {
		render(<RunOverView view={deadView()} onNewRun={vi.fn()} />);

		expect(screen.getByRole("button", { name: "Community" })).toBeDisabled();
	});

	it("opens the community door once a caller takes it", async () => {
		const onCommunity = vi.fn();

		render(
			<RunOverView
				view={deadView()}
				onNewRun={vi.fn()}
				onCommunity={onCommunity}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "Community" }));

		expect(onCommunity).toHaveBeenCalledOnce();
	});
});
