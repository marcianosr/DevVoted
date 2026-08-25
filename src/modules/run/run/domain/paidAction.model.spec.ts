import { describe, expect, it } from "vitest";

import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import {
	canBuyPeek,
	lintApplies,
	lintFeeFor,
} from "~/modules/run/run/domain/paidAction.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	answerWith,
	handed,
	started,
} from "~/modules/run/run/domain/run.factory";

describe("the lint fee", () => {
	// Three options so the lint action applies (it needs >1 wrong option left).
	const lintablePoll = (id: string, correct: boolean): RunPoll => ({
		id,
		category: "js",
		question: `Does ${id} lint?`,
		answerType: "single",
		options: [
			{ id: `${id}-a`, label: "A", correct },
			{ id: `${id}-b`, label: "B", correct: false },
			{ id: `${id}-c`, label: "C", correct: !correct },
		],
	});

	const lintableRun = (): RunState => {
		let state = createRun(
			Array.from({ length: 10 }, (_, index) =>
				lintablePoll(`lintable-${index}`, true)
			),
			handed
		);
		for (const configId of ["eslint", "ts", "css"])
			state = runReducer(state, { type: "slot", configId });
		state = runReducer(state, { type: "start" });
		return { ...state, storage: 100 };
	};

	it("clears a window that never linted — the fee is a choice, never owed", () => {
		let state = lintableRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("doubles the fee at a Cost Overrun gate (ADR-038)", () => {
		const overrun: RunState = { ...lintableRun(), gatesCleared: 3 };
		expect(lintFeeFor(overrun)).toBe(16); // the 8KB rung, doubled
		expect(runReducer(overrun, { type: "lint-poll" }).storage).toBe(84);
	});

	it("takes the action away entirely at a Feature Freeze gate (ADR-038)", () => {
		const frozen: RunState = { ...lintableRun(), gatesCleared: 6 };
		expect(lintApplies(frozen)).toBe(false);
		expect(runReducer(frozen, { type: "lint-poll" })).toBe(frozen);
	});

	it("charges the fee for a lint but demands nothing back for it", () => {
		let state = lintableRun();
		state = runReducer(state, { type: "lint-poll" });
		expect(state.storage).toBe(92); // -8KB lint fee
		state = answerWith(state, false); // the linted poll still missed
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});
});

describe("Telemetry peeks", () => {
	// ts/css masteries skip on the react-only pool, so Telemetry's is the only
	// check that judges this window.
	const peekingRun = (): RunState => ({
		...started(["telemetry"]),
		storage: 200,
	});

	const peek = (state: RunState): RunState =>
		runReducer(state, { type: "peek-poll" });

	it("charges 32KB and records the poll it bought", () => {
		const state = peek(peekingRun());
		expect(state.storage).toBe(168);
		expect(state.peekedPollIds).toEqual([state.polls[0].id]);
		expect(state.window.peeked).toBe(1);
	});

	it("doubles the fee for a second peek in the same gate", () => {
		let state = peek(peekingRun());
		state = answerWith(state, true);
		state = peek(state);
		expect(state.storage).toBe(104); // 200 - 32 - 64
	});

	it("refuses a second peek on the same poll — the split comes over once", () => {
		const bought = peek(peekingRun());
		expect(peek(bought)).toBe(bought);
	});

	it("refuses a peek no installed config sells", () => {
		const state = { ...started(["js"]), storage: 200 };
		expect(peek(state)).toBe(state);
	});

	it("refuses a peek the balance cannot cover", () => {
		const broke = { ...peekingRun(), storage: 31 };
		expect(peek(broke)).toBe(broke);
	});

	it("clears a window that never peeked — the fee is a choice, never owed (ADR-035)", () => {
		let state = peekingRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.status).toBe("rewarding");
	});

	it("does not care how a peeked poll was answered", () => {
		let state = peek(peekingRun());
		state = answerWith(state, false);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("resets the ladder at the next gate, so a peek never gets permanently expensive", () => {
		let state = peek(peekingRun());
		state = answerWith(state, true);
		state = peek(state);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.peeked).toBe(0);
	});

	it("refuses a peek on a balance under the first rung", () => {
		const state = { ...peekingRun(), storage: 31 };
		expect(canBuyPeek(state)).toBe(false);
	});

	it("keeps peeked polls for the whole run, so the split survives a later gate", () => {
		let state = peek(peekingRun());
		const peekedId = state.polls[0].id;
		state = answerWith(state, true);
		state = peek(state);
		for (let i = 0; i < SLICE_WINDOW - 1; i++) state = answerWith(state, true);
		expect(state.peekedPollIds).toContain(peekedId);
		expect(state.peekedPollIds).toHaveLength(2);
	});
});
