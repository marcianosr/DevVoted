import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	createMockGateClose,
	createMockGateStake,
	createMockRunView,
} from "~/test/runView.factory";

import { runOverFrameOf } from "~/modules/run/run/application/runOverScreen.viewmodel";

import { RunOverView } from "./RunOverView.component";

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

	it("draws the bar where the run stood when no gate closed it", () => {
		const { bar } = runOverFrameOf(deadView());

		expect(bar).toEqual({
			floor: 34,
			ok: 42,
			healthy: 50,
			held: 22,
			band: "danger",
		});
	});

	it("draws the bar the gate really closed on, unclamped", () => {
		const { bar } = runOverFrameOf(
			createMockRunView({
				...deadView(),
				lastClose: createMockGateClose({
					gate: 4,
					closing: "fatal",
					cleared: false,
					band: "danger",
					held: 3,
					ladder: { floor: 34, ok: 42, healthy: 50 },
				}),
			})
		);

		expect(bar).toEqual({
			floor: 34,
			ok: 42,
			healthy: 50,
			held: 3,
			band: "danger",
		});
	});

	it("hands the build's figures over from the run view", () => {
		const frame = runOverFrameOf(
			createMockRunView({
				...deadView(),
				buildSpace: {
					space: 8,
					weight: 5,
					freeWeight: 3,
					emptyCreditKb: 24,
					perGateKb: 40,
					coveredSpace: null,
				},
			})
		);

		expect(frame).toMatchObject({
			weight: 5,
			freeWeight: 3,
			emptyCreditKb: 24,
			upkeepKb: 40,
		});
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
			screen.getByRole("button", { name: /^Start new run/ })
		);

		expect(onNewRun).toHaveBeenCalledOnce();
	});

	it("refuses the new-run press out loud when the day is spent, saying when polls return", () => {
		render(
			<RunOverView
				view={deadView()}
				onNewRun={vi.fn()}
				startRefusal="New polls in 7h 23m"
			/>
		);

		expect(
			screen.getByRole("button", { name: /^Start new run/ })
		).toBeDisabled();
		expect(screen.getByText("New polls in 7h 23m")).toBeInTheDocument();
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
