import { describe, expect, it } from "vitest";

import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	createRun,
	hiddenOptionIdsOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import {
	buyBackFeeFor,
	canBuyBack,
	canBuyPeek,
	lintApplies,
	lintFeeFor,
} from "~/modules/run/run/domain/paidAction.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import {
	answerWith,
	audited,
	failGate,
	handed,
	started,
} from "~/modules/run/run/domain/run.factory";

describe("the lint fee", () => {
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
		for (const configId of ["linter", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
		state = runReducer(state, { type: "start" });
		return { ...state, storage: 100 };
	};

	it("clears a window that never linted — the fee is a choice, never owed", () => {
		let state = lintableRun();
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("doubles the fee at a Cost Overrun gate (ADR-038)", () => {
		const overrun: RunState = audited(lintableRun(), 3, "cost-overrun");
		expect(lintFeeFor(overrun)).toBe(16);
		expect(runReducer(overrun, { type: "lint-poll" }).storage).toBe(84);
	});

	it("stops at one paid action a window at a 429 Too Many Requests gate", () => {
		const limited: RunState = audited(lintableRun(), 10, "too-many-requests");
		expect(lintApplies(limited)).toBe(true);

		const spent = runReducer(limited, { type: "lint-poll" });
		expect(spent.window.linted).toBe(1);
		expect(lintApplies(spent)).toBe(false);
		expect(canBuyPeek(spent)).toBe(false);
	});

	it("counts the peek against the same allowance as the linter", () => {
		const limited: RunState = {
			...audited(lintableRun(), 10, "too-many-requests"),
			window: { ...lintableRun().window, peeked: 1 },
		};
		expect(lintApplies(limited)).toBe(false);
	});

	it("takes the action away entirely at a 403 Forbidden gate (ADR-038)", () => {
		const frozen: RunState = audited(lintableRun(), 11, "feature-freeze");
		expect(lintApplies(frozen)).toBe(false);
		expect(runReducer(frozen, { type: "lint-poll" })).toBe(frozen);
	});

	it("charges the fee for a lint but demands nothing back for it", () => {
		let state = lintableRun();
		state = runReducer(state, { type: "lint-poll" });
		expect(state.storage).toBe(92);
		state = answerWith(state, false);
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	it("climbs the ladder across the gate, so a later poll's cross-out costs double", () => {
		let state = lintableRun();
		expect(lintFeeFor(state)).toBe(8);
		state = runReducer(state, { type: "lint-poll" });
		state = answerWith(state, true);
		expect(lintFeeFor(state)).toBe(16);
		expect(runReducer(state, { type: "lint-poll" }).storage).toBe(76);
	});

	const atVersion = (state: RunState, level: number): RunState => ({
		...state,
		build: {
			...state.build,
			configs: state.build.configs.map((config) =>
				config.id === "linter" ? { ...config, level } : config
			),
		},
	});

	const redoAfterLinting = (state: RunState, lints: number): RunState => {
		let next = failGate(state);
		while (next.peelSlotsRemaining > 0)
			next = runReducer(next, {
				type: "strip",
				configIds: [next.build.configs[next.build.configs.length - 1].id],
			});
		return runReducer(
			{
				...next,
				lintsThisRun: lints,
				window: { ...next.window, linted: lints },
			},
			{ type: "resume-climb" }
		);
	};

	it("carries the ladder across a clear at v1, so the linter gets dearer for the whole run", () => {
		let state = runReducer(lintableRun(), { type: "lint-poll" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.linted).toBe(0);
		expect(state.lintsThisRun).toBe(1);
		expect(lintFeeFor(state)).toBe(16);
	});

	it("carries the ladder across a redo at v1", () => {
		const state = redoAfterLinting(lintableRun(), 3);
		expect(state.window.linted).toBe(0);
		expect(lintFeeFor(state)).toBe(64);
	});

	it("resets the ladder at the next gate at v2, so the linter never gets permanently expensive", () => {
		let state = runReducer(atVersion(lintableRun(), 2), { type: "lint-poll" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.linted).toBe(0);
		expect(lintFeeFor(state)).toBe(8);
	});

	it("resets the ladder for a redo at v2, not only for a clear", () => {
		const state = redoAfterLinting(atVersion(lintableRun(), 2), 3);
		expect(state.window.linted).toBe(0);
		expect(lintFeeFor(state)).toBe(8);
	});

	it("halves every rung at v3", () => {
		let state = atVersion(lintableRun(), 3);
		expect(lintFeeFor(state)).toBe(4);
		state = runReducer(state, { type: "lint-poll" });
		expect(state.storage).toBe(96);
		expect(lintFeeFor(state)).toBe(8);
	});

	it("reads a v3 Linter at v1 under 510 Not Extended: full price, and the ladder carries", () => {
		const flattened = audited(atVersion(lintableRun(), 3), 3, "not-extended");
		expect(lintFeeFor(flattened)).toBe(8);
		const carried = { ...flattened, lintsThisRun: 2 };
		expect(lintFeeFor(carried)).toBe(32);
		expect(lintFeeFor(runReducer(carried, { type: "lint-poll" }))).toBe(64);
	});

	it("prices from the window's ladder when no poll is on deck", () => {
		const state = lintableRun();
		expect(lintFeeFor({ ...state, currentIndex: state.polls.length })).toBe(8);
	});
});

describe("Telemetry peeks", () => {
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
		expect(state.storage).toBe(104);
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

describe("buying back a redacted answer (451)", () => {
	const sealedPoll = (id: string): RunPoll => ({
		id,
		category: "js",
		question: `Which ${id}?`,
		answerType: "single",
		options: [
			{ id: `${id}-a`, label: "Alpha", correct: true },
			{ id: `${id}-b`, label: "Bravo", correct: false },
			{ id: `${id}-c`, label: "Charlie", correct: false },
			{ id: `${id}-d`, label: "Delta", correct: false },
		],
	});

	const heldRun = (...ids: AuditId[]): RunState => {
		let state = createRun(
			Array.from({ length: 10 }, (_, index) => sealedPoll(`sealed-${index}`)),
			handed,
			8
		);
		for (const configId of ["linter", "ts", "css"])
			state = runReducer(state, { type: "install", configId });
		state = runReducer(state, { type: "start" });
		return {
			...audited({ ...state, storage: 500 }, 8, "legal-hold", ...ids),
		};
	};

	const sealedOn = (state: RunState): readonly string[] =>
		hiddenOptionIdsOf(state);

	it("seals two of the four answers", () => {
		expect(sealedOn(heldRun())).toHaveLength(2);
	});

	it("charges a flat 4KB and unseals the answer", () => {
		const state = heldRun();
		const target = sealedOn(state)[0];
		const bought = runReducer(state, {
			type: "buy-back-option",
			optionId: target,
		});
		expect(bought.storage).toBe(496);
		expect(sealedOn(bought)).not.toContain(target);
	});

	it("charges the same 4KB the second time — there is no ladder", () => {
		let state = heldRun();
		const [first, second] = sealedOn(state);
		state = runReducer(state, { type: "buy-back-option", optionId: first });
		state = runReducer(state, { type: "buy-back-option", optionId: second });
		expect(state.storage).toBe(492);
		expect(sealedOn(state)).toEqual([]);
	});

	it("doubles the flat fee at a 402 Payment Required gate", () => {
		const state = heldRun("cost-overrun");
		expect(buyBackFeeFor(state)).toBe(8);
	});

	it("refuses an answer that was never sealed", () => {
		const state = heldRun();
		const readable = state.polls[state.currentIndex].options
			.map((option) => option.id)
			.find((id) => !sealedOn(state).includes(id));
		expect(
			runReducer(state, { type: "buy-back-option", optionId: readable! })
		).toBe(state);
	});

	it("refuses a second buy-back of the same answer", () => {
		const state = heldRun();
		const target = sealedOn(state)[0];
		const once = runReducer(state, {
			type: "buy-back-option",
			optionId: target,
		});
		expect(
			runReducer(once, { type: "buy-back-option", optionId: target })
		).toBe(once);
	});

	it("refuses a buy-back the balance cannot cover", () => {
		const state = { ...heldRun(), storage: 3 };
		expect(canBuyBack(state, sealedOn(state)[0])).toBe(false);
	});

	it("survives a 403 Forbidden gate, which freezes the other two", () => {
		const state = heldRun("feature-freeze");
		expect(canBuyBack(state, sealedOn(state)[0])).toBe(true);
		expect(lintApplies(state)).toBe(false);
	});

	it("leaves the rate limit alone at a 429 Too Many Requests gate", () => {
		const state = heldRun("too-many-requests");
		const [first, second] = sealedOn(state);
		let bought = runReducer(state, {
			type: "buy-back-option",
			optionId: first,
		});
		bought = runReducer(bought, { type: "buy-back-option", optionId: second });
		expect(sealedOn(bought)).toEqual([]);
	});

	it("keeps a bought-back answer for the whole run, so a reload never re-charges", () => {
		const state = heldRun();
		const target = sealedOn(state)[0];
		const bought = runReducer(state, {
			type: "buy-back-option",
			optionId: target,
		});
		expect(bought.boughtBackOptionIds).toContain(target);
	});

	it("keeps the linter off the sealed answers", () => {
		const state = heldRun();
		const sealed = new Set(sealedOn(state));
		const linted = runReducer(state, { type: "lint-poll" });
		for (const id of linted.manualDisabled) expect(sealed.has(id)).toBe(false);
	});

	it("lets the linter cross out an answer once it has been bought back", () => {
		let state = heldRun();
		const wrongSealed = sealedOn(state).find((id) =>
			state.polls[state.currentIndex].options.some(
				(option) => option.id === id && !option.correct
			)
		);
		state = runReducer(state, {
			type: "buy-back-option",
			optionId: wrongSealed!,
		});
		expect(lintApplies(state)).toBe(true);
	});
});
