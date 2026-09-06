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
		expect(lintFeeFor(overrun)).toBe(16); // the 8KB rung, doubled
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
		expect(state.storage).toBe(92); // -8KB lint fee
		state = answerWith(state, false); // the linted poll still missed
		for (let i = 0; i < 4; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
	});

	// The cross-out is unlimited and the ladder is the only thing metering it.
	// Its position used to live on `manualDisabled`, which every answer clears,
	// so the fee reset per poll and a whole gate linted at 8KB a go.
	it("climbs the ladder across the gate, so a later poll's cross-out costs double", () => {
		let state = lintableRun();
		expect(lintFeeFor(state)).toBe(8);
		state = runReducer(state, { type: "lint-poll" });
		state = answerWith(state, true);
		expect(lintFeeFor(state)).toBe(16);
		expect(runReducer(state, { type: "lint-poll" }).storage).toBe(76);
	});

	it("resets the ladder at the next gate, so the linter never gets permanently expensive", () => {
		let state = runReducer(lintableRun(), { type: "lint-poll" });
		for (let i = 0; i < SLICE_WINDOW; i++) state = answerWith(state, true);
		expect(state.clearedGate).toBe(0);
		expect(state.window.linted).toBe(0);
		expect(lintFeeFor(state)).toBe(8);
	});

	// A redo replays the gate from scratch (ADR-037) on a fresh window, so the fee
	// it was climbing comes back down with it.
	it("resets the ladder for a redo, not only for a clear", () => {
		let state = failGate(lintableRun());
		while (state.peelSlotsRemaining > 0)
			state = runReducer(state, {
				type: "strip",
				// Never the linter: peeling it would answer a different question.
				configId: state.build.configs[state.build.configs.length - 1].id,
			});
		state = runReducer(
			{ ...state, window: { ...state.window, linted: 3 } },
			{ type: "resume-climb" }
		);
		expect(state.window.linted).toBe(0);
		expect(lintFeeFor(state)).toBe(8);
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
		for (const configId of ["eslint", "ts", "css"])
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

	// 403 freezes the linter and the peek, never this: a seal you are forbidden
	// to read is a trap rather than a rule, whichever way the seal arrived.
	it("survives a 403 Forbidden gate, which freezes the other two", () => {
		const state = heldRun("feature-freeze");
		expect(canBuyBack(state, sealedOn(state)[0])).toBe(true);
		expect(lintApplies(state)).toBe(false);
	});

	// The restorative exemption: 429 caps the window at one paid action, and
	// metering the audit's own escape hatch against it would strand the window.
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

	// Crossing out a sealed option would state that it is wrong, which is the
	// leak the redaction exists to prevent.
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
