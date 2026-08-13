import { describe, expect, it } from "vitest";

import {
	createRun,
	runReducer,
	RunPoll,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import {
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	type Config,
	draftCost,
} from "~/modules/run/config/domain/config.model";
import {
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
} from "~/modules/run/shop/domain/draft.model";
import {
	dropCount,
	minConfigsForGate,
	SLICE_WINDOW,
	storagePlanFor,
	STORAGE_PLANS,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { createMockRunView } from "~/test/runView.factory";
import {
	correctOptionIdsFor,
	latestAnswerScore,
	type RunView,
	shopExitFor,
	toRunView,
} from "~/modules/run/run/application/runView.viewmodel";

const poll = (id: string): RunPoll => ({
	id,
	category: "react",
	question: `${id}?`,
	answerType: "single",
	options: [
		{ id: `${id}-a`, label: "Yes", correct: true },
		{ id: `${id}-b`, label: "No", correct: false },
	],
});

// View specs bypass the full-pipeline start rule: the status is forced so the
// pipeline holds exactly the configs under test, nothing more.
const answering = () => ({
	...createRun([poll("q0"), poll("q1")], [CONFIGS.js]),
	status: "answering" as const,
});

const answeringWith = (configs: Config[]) => {
	let state = createRun([poll("q0"), poll("q1")], configs);
	for (const config of configs)
		state = runReducer(state, { type: "slot", configId: config.id });
	return { ...state, status: "answering" as const };
};

describe("toRunView", () => {
	it("redacts option correctness from the current poll", () => {
		const view = toRunView(answering());
		expect(view.poll).not.toBeNull();
		for (const option of view.poll!.options) {
			expect("correct" in option).toBe(false);
		}
	});

	it("exposes only the current poll, never the upcoming ones", () => {
		expect(toRunView(answering()).poll?.id).toBe("q0");
	});

	it("hides the poll when not answering", () => {
		const view = toRunView(createRun([poll("q0")], [CONFIGS.js]));
		expect(view.status).toBe("configuring");
		expect(view.poll).toBeNull();
	});

	it("derives everything the wired client needs without touching RunState", () => {
		const view = toRunView(answering());
		expect(view.disabledOptionIds).toEqual([]);
		expect(view.lintCost).toBeGreaterThan(0);
		expect(view.rebuildCost).toBeGreaterThan(0);
		expect(view.canRebuild).toBe(false); // fresh run starts at 0 KB
		expect(view.slotCoverageRequired).toBeGreaterThan(0);
		expect(view.justUnlockedSlots).toEqual([]); // no coverage earned yet
	});

	it("surfaces the gate checks and stats a screen needs", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		// The .js build owes only its own check — no baseline row (ADR-017).
		expect(view.checks.map((check) => check.label)).toEqual([".js mastery"]);
		expect(view.pollsPerGate).toBe(5);
		expect(view.victoryGate).toBeGreaterThan(0);
	});

	it("surfaces the gate's width demand and flags a build under it (ADR-027)", () => {
		// The demand ramps with the gate: Pallet asks nothing, so the early
		// climb farms freely; deeper gates demand one config over their quota.
		expect(toRunView(answeringWith([CONFIGS.js])).minConfigs).toBe(0);

		const thin = toRunView({
			...answeringWith([CONFIGS.js]),
			gatesCleared: 4,
		});
		expect(thin.minConfigs).toBe(4);
		expect(thin.underMinConfigs).toBe(true);

		const met = toRunView({
			...answeringWith([CONFIGS.js, CONFIGS.eslint]),
			gatesCleared: 2,
		});
		expect(met.underMinConfigs).toBe(false);
	});

	describe("the shop exit (ADR-031)", () => {
		const shopView = (overrides: Partial<RunView>): RunView =>
			createMockRunView({ gatesCleared: 4, minConfigs: 4, ...overrides });

		it("opens toward the gate while the build meets the demand", () => {
			const exit = shopExitFor(shopView({ underMinConfigs: false }));
			expect(exit).toEqual({ state: "open", gate: 4 });
		});

		it("blocks and measures the shortfall while the shop can repair it", () => {
			const exit = shopExitFor(
				shopView({
					underMinConfigs: true,
					widthRepairable: true,
					configs: [CONFIGS.js],
				})
			);
			expect(exit).toEqual({
				state: "blocked",
				gate: 4,
				demand: 4,
				shortfall: 3,
			});
		});

		it("turns into the explicit end-run verdict once the build is stuck", () => {
			const exit = shopExitFor(
				shopView({ underMinConfigs: true, widthRepairable: false })
			);
			expect(exit).toEqual({ state: "stuck", gate: 4, demand: 4 });
		});
	});

	it("tells a repairable width shortfall from a provably stuck one (ADR-031)", () => {
		const thin = {
			...answeringWith([CONFIGS.js]),
			gatesCleared: 4,
			draftOptions: [CONFIGS.eslint],
		};

		const funded = toRunView({ ...thin, storage: 1000 });
		expect(funded.widthRepairable).toBe(true);

		const broke = toRunView({ ...thin, storage: 0 });
		expect(broke.widthRepairable).toBe(false);

		const slotCapped = toRunView({
			...thin,
			storage: 1000,
			pipeline: { ...thin.pipeline, slots: thin.pipeline.configs.length },
		});
		expect(slotCapped.widthRepairable).toBe(false);
	});

	it("keeps awaitingTomorrow off while a poll is on deck", () => {
		expect(toRunView(answering()).awaitingTomorrow).toBe(false);
	});

	it("raises awaitingTomorrow when answering with the day's polls exhausted", () => {
		const exhausted = { ...answering(), currentIndex: 2 };
		const view = toRunView(exhausted);
		expect(view.awaitingTomorrow).toBe(true);
		expect(view.poll).toBeNull();
	});

	it("keeps awaitingTomorrow off outside the answering status", () => {
		const configuring = createRun([], [CONFIGS.js]);
		expect(toRunView(configuring).awaitingTomorrow).toBe(false);
	});

	it("names the gate a clear beat, one behind the count it advanced", () => {
		const cleared = { ...answering(), gatesCleared: 3, clearedGate: 2 };
		expect(toRunView(cleared).clearedGateNumber).toBe(2);
	});

	it("falls back to gatesCleared for snapshots without clearedGate", () => {
		expect(
			toRunView({ ...answering(), gatesCleared: 2 }).clearedGateNumber
		).toBe(2);
	});

	// The ambient theme follows the gate being played (ADR-020): the fresh run
	// wears Pallet, the summit pair keep their own themes, and past the last
	// gate there is nothing left to wear — the :root default takes over.
	it("themes the run after the gate being played", () => {
		expect(toRunView(answering()).gateTheme).toBe("pallet");
		expect(toRunView({ ...answering(), gatesCleared: 11 }).gateTheme).toBe(
			"elite"
		);
		expect(toRunView({ ...answering(), gatesCleared: 12 }).gateTheme).toBe(
			"champion"
		);
	});

	it("drops the gate theme once the last gate is beaten", () => {
		expect(
			toRunView({ ...answering(), gatesCleared: 13 }).gateTheme
		).toBeUndefined();
	});
});

// Staged exposure is the viewmodel's call: the reducer refuses an early control
// anyway, but only this decides whether the shop draws it at all.
describe("shop controls (DVTD-5lt6)", () => {
	const shopping = (gatesCleared: number, storage: number) => ({
		...answering(),
		gatesCleared,
		storage,
	});

	it("hides both new controls in the opening shop", () => {
		const view = toRunView(shopping(1, 512));
		expect(view.lockAvailable).toBe(false);
		expect(view.extendAvailable).toBe(false);
	});

	it("stages the lock in a gate before the extension", () => {
		expect(toRunView(shopping(LOCK_FROM_GATE, 512)).lockAvailable).toBe(true);
		expect(toRunView(shopping(LOCK_FROM_GATE, 512)).extendAvailable).toBe(
			false
		);
		expect(toRunView(shopping(EXTEND_FROM_GATE, 512)).extendAvailable).toBe(
			true
		);
	});

	it("keeps showing a control the run cannot afford, unpressable", () => {
		const view = toRunView(shopping(EXTEND_FROM_GATE, 0));
		expect(view.lockAvailable).toBe(true);
		expect(view.canLock).toBe(false);
		expect(view.extendAvailable).toBe(true);
		expect(view.canExtend).toBe(false);
	});

	it("takes the lock off the table while one is held", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			lockedOfferIds: ["eslint"],
		});
		expect(view.lockAvailable).toBe(false);
		expect(view.lockedOfferIds).toEqual(["eslint"]);
	});

	it("prices the next extension against the ones already bought", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			extensionsBought: 1,
		});
		expect(view.extendCost).toBe(extendCost(1));
	});

	it("stops offering extensions once the run holds them all", () => {
		const view = toRunView({
			...shopping(EXTEND_FROM_GATE, 512),
			extensionsBought: MAX_EXTENSIONS,
		});
		expect(view.extendAvailable).toBe(false);
	});
});

describe("the storage-plan ladder in the shop (ADR-030)", () => {
	const atGate = (gatesCleared: number) =>
		toRunView({ ...answering(), gatesCleared, storage: 0 }).storagePlans;

	it("draws only the rungs a shallow run has reached, plus the next one", () => {
		const rungs = atGate(0);
		expect(rungs.filter((rung) => !rung.locked)).toHaveLength(2);
		expect(rungs.filter((rung) => rung.locked)).toHaveLength(1);
	});

	it("unlocks the drawn rung once the run clears its gate", () => {
		const locked = atGate(0).find((rung) => rung.locked);
		const later = atGate(locked?.fromGate ?? 0).find(
			(rung) => rung.tier === locked?.tier
		);
		expect(later?.locked).toBe(false);
	});

	it("offers the whole ladder to a run at the summit", () => {
		expect(atGate(VICTORY_GATE)).toHaveLength(STORAGE_PLANS.length);
		expect(atGate(VICTORY_GATE).every((rung) => !rung.locked)).toBe(true);
	});

	it("marks the plan the run is actually on", () => {
		const view = toRunView({ ...answering(), gatesCleared: 4, storagePlan: 3 });
		expect(view.storagePlans.find((rung) => rung.current)?.tier).toBe(3);
	});
});

describe("latestAnswerScore", () => {
	it("is null before any answer this gate", () => {
		expect(latestAnswerScore(toRunView(answering()))).toBeNull();
	});

	it("breaks a correct answer into base, streak, and total", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		// .js Focus is a no-op on a react poll, so no config chip; streak 1 → +0.1.
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.1,
			configBonuses: [],
			earnedCoverage: 1.1,
		});
	});

	it("adds a chip for a coverage-affecting config and sums the total", () => {
		const state = runReducer(answeringWith([CONFIGS.agentsMd]), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: true,
			baseCoverage: 1,
			streakBonus: 0.2,
			configBonuses: [{ configId: "agents-md", value: 1 }],
			earnedCoverage: 2.2,
		});
	});

	it("reads a miss as a negative base and no bonuses", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-b"],
		});
		expect(latestAnswerScore(toRunView(state))).toEqual({
			isCorrect: false,
			baseCoverage: -0.5,
			streakBonus: 0,
			configBonuses: [],
			earnedCoverage: -0.5,
		});
	});

	it("omits the difficulty boost for a baseline single-choice poll", () => {
		const state = runReducer(answering(), {
			type: "answer",
			optionIds: ["q0-a"],
		});
		expect(latestAnswerScore(toRunView(state))?.difficulty).toBeUndefined();
	});

	it("surfaces the difficulty boost for a multiple-choice poll", () => {
		const multiPoll: RunPoll = {
			id: "q0",
			category: "react",
			question: "Pick both?",
			answerType: "multiple",
			options: [
				{ id: "q0-a", label: "A", correct: true },
				{ id: "q0-b", label: "B", correct: true },
				{ id: "q0-c", label: "C", correct: false },
			],
		};
		const state = runReducer(
			{
				...createRun([multiPoll, poll("q1")], [CONFIGS.js]),
				status: "answering" as const,
			},
			{ type: "answer", optionIds: ["q0-a", "q0-b"] }
		);
		expect(latestAnswerScore(toRunView(state))?.difficulty).toEqual({
			multiplier: 1.5,
			optionCount: 3,
			isMultiple: true,
		});
	});
});

describe("correctOptionIdsFor", () => {
	it("maps the verdict back to option ids on the poll that was on screen", () => {
		const onScreen = toRunView(answering());
		const answered = toRunView(
			runReducer(answering(), { type: "answer", optionIds: ["q0-b"] })
		);
		expect(correctOptionIdsFor(onScreen.poll!, answered)).toEqual(["q0-a"]);
	});

	it("is empty when nothing has been answered", () => {
		const onScreen = toRunView(answering());
		expect(correctOptionIdsFor(onScreen.poll!, onScreen)).toEqual([]);
	});
});

describe("the view answers what screens used to re-derive (DVTD-z1ij)", () => {
	const configuringWith = (configs: Config[]) => {
		let state = createRun([poll("q0"), poll("q1")], configs);
		for (const config of configs)
			state = runReducer(state, { type: "slot", configId: config.id });
		return state;
	};

	// These pin canStart to the reducer rather than to a hard-coded slot count:
	// if the engine's start rule moves, a view that disagrees fails here.
	it("offers canStart only when the reducer would actually start the run", () => {
		const partial = configuringWith([CONFIGS.js, CONFIGS.ts]);
		expect(toRunView(partial).canStart).toBe(false);
		expect(runReducer(partial, { type: "start" }).status).toBe("configuring");
	});

	it("offers canStart once the pipeline is full, and the reducer agrees", () => {
		const full = configuringWith([CONFIGS.js, CONFIGS.ts, CONFIGS.css]);
		expect(toRunView(full).canStart).toBe(true);
		expect(runReducer(full, { type: "start" }).status).toBe("answering");
	});

	it("reports isOver for both terminal statuses and no others", () => {
		const base = answering();
		expect(toRunView({ ...base, status: "won" }).isOver).toBe(true);
		expect(toRunView({ ...base, status: "dead" }).isOver).toBe(true);

		const live = ["configuring", "answering", "awaiting-strip", "rewarding"];
		for (const status of live)
			expect(toRunView({ ...base, status } as RunState).isOver).toBe(false);
	});

	it("hands modifiers over as one object rather than four loose fields", () => {
		const view = toRunView(answeringWith([CONFIGS.js]));
		expect(view.modifiers).toEqual(
			pipelineModifiersFor(answeringWith([CONFIGS.js]).pipeline.configs)
		);
	});

	it("prices one answer so screens do not call the domain themselves", () => {
		const state = answeringWith([CONFIGS.js]);
		expect(toRunView(state).perAnswer).toEqual(
			perAnswerPreviewFor(state.pipeline.configs, state.gatesCleared)
		);
	});
});

// Prep, Configuring and Shop all render GateStakeReceipt, and each used to carry
// the seven fields as props purely to hand them on (DVTD-gf7h).
describe("the gate stake travels as one object", () => {
	it("collects what the coming gate demands and pays", () => {
		const state = { ...answeringWith([CONFIGS.js]), gatesCleared: 4 };
		const view = toRunView(state);

		expect(view.gateStake).toEqual({
			gateNumber: 4,
			pollsPerGate: SLICE_WINDOW,
			stripsOnFailure: dropCount(4),
			minConfigs: minConfigsForGate(4),
			billKb: storagePlanFor(state.storagePlan).billKb,
			modifiers: view.modifiers,
			perAnswer: view.perAnswer,
		});
	});

	it("agrees with the flat fields the other screens still read", () => {
		const view = toRunView({ ...answeringWith([CONFIGS.js]), gatesCleared: 4 });
		expect(view.gateStake.gateNumber).toBe(view.gatesCleared);
		expect(view.gateStake.minConfigs).toBe(view.minConfigs);
		expect(view.gateStake.stripsOnFailure).toBe(view.stripsOnFailure);
		expect(view.gateStake.billKb).toBe(view.storageBillKb);
	});
});

// Each shop control used to be graded twice — once as a reducer guard, once as
// a view flag built from the same constants (DVTD-xg62). These drive both off
// the one predicate, so a button can never offer what the reducer refuses.
describe("the shop's controls answer to the reducer", () => {
	// The shop's controls only answer in `rewarding` — that status gate is the
	// reducer's, and these tests are about the predicates behind it.
	const shopWith = (state: RunState, storage: number): RunState => ({
		...state,
		status: "rewarding",
		storage,
	});

	it("offers a rebuild exactly when the reducer performs one", () => {
		const rich = shopWith(answering(), 512);
		const broke = shopWith(answering(), 0);

		expect(toRunView(rich).canRebuild).toBe(true);
		expect(runReducer(rich, { type: "rebuild-draft" }).rebuildsUsed).toBe(1);

		expect(toRunView(broke).canRebuild).toBe(false);
		expect(runReducer(broke, { type: "rebuild-draft" }).rebuildsUsed).toBe(0);
	});

	it("offers the lock exactly when the reducer takes one", () => {
		const onOffer = { ...answering(), draftOptions: [CONFIGS.eslint] };
		const deep = shopWith({ ...onOffer, gatesCleared: LOCK_FROM_GATE }, 512);
		const shallow = shopWith({ ...onOffer, gatesCleared: 0 }, 512);
		const broke = shopWith({ ...onOffer, gatesCleared: LOCK_FROM_GATE }, 0);
		const lock = { type: "lock-offer", configId: CONFIGS.eslint.id } as const;

		expect(toRunView(deep).lockAvailable && toRunView(deep).canLock).toBe(true);
		expect(runReducer(deep, lock).lockedOfferIds).toEqual([CONFIGS.eslint.id]);

		expect(toRunView(shallow).lockAvailable).toBe(false);
		expect(runReducer(shallow, lock).lockedOfferIds).toEqual([]);

		expect(toRunView(broke).canLock).toBe(false);
		expect(runReducer(broke, lock).lockedOfferIds).toEqual([]);
	});

	it("offers the extension exactly when the reducer buys one", () => {
		const deep = shopWith(
			{ ...answering(), gatesCleared: EXTEND_FROM_GATE },
			512
		);
		const maxed = { ...deep, extensionsBought: MAX_EXTENSIONS };
		const broke = shopWith(
			{ ...answering(), gatesCleared: EXTEND_FROM_GATE },
			0
		);
		const extend = { type: "extend-offers" } as const;

		expect(toRunView(deep).extendAvailable && toRunView(deep).canExtend).toBe(
			true
		);
		expect(runReducer(deep, extend).extensionsBought).toBe(1);

		expect(toRunView(maxed).extendAvailable).toBe(false);
		expect(runReducer(maxed, extend).extensionsBought).toBe(MAX_EXTENSIONS);

		expect(toRunView(broke).canExtend).toBe(false);
		expect(runReducer(broke, extend).extensionsBought).toBe(0);
	});

	it("flags the width floor exactly where the reducer refuses to shrink", () => {
		// Gate 2 demands 2, so a two-config build is on its floor.
		const onFloor: RunState = {
			...answeringWith([CONFIGS.js, CONFIGS.ts]),
			status: "rewarding",
			gatesCleared: 2,
		};
		const target = onFloor.pipeline.configs[0].id;

		expect(toRunView(onFloor).atMinimumWidth).toBe(true);
		expect(
			runReducer(onFloor, { type: "sell", configId: target }).pipeline.configs
		).toHaveLength(2);
		expect(
			runReducer(onFloor, { type: "drop", configId: target }).pipeline.configs
		).toHaveLength(2);
	});
});

// The shop used to answer all of this itself from raw roster configs, which put
// offer pricing behind render() and out of reach of this spec (DVTD-od1l).
describe("the view prices the shop's offers", () => {
	const shopping = (overrides: Partial<RunState> = {}): RunState => ({
		...answeringWith([CONFIGS.js]),
		status: "rewarding",
		storage: 512,
		draftOptions: [CONFIGS.eslint],
		...overrides,
	});

	const only = (state: RunState) => toRunView(state).offers[0];

	it("prices each offer and clears it for install when the run can pay", () => {
		const offer = only(shopping());
		expect(offer.config.id).toBe("eslint");
		expect(offer.priceKb).toBe(draftCost(CONFIGS.eslint));
		expect(offer.installable).toBe(true);
		expect(offer.refusal).toBeNull();
	});

	it("refuses an offer the run cannot afford, naming both numbers", () => {
		const offer = only(shopping({ storage: 8 }));
		expect(offer.installable).toBe(false);
		expect(offer.refusal).toEqual({
			reason: "too-expensive",
			priceKb: draftCost(CONFIGS.eslint),
			storageKb: 8,
		});
	});

	it("refuses every offer once the pipeline has no free slot", () => {
		const full = answeringWith([CONFIGS.js]);
		const offer = only(
			shopping({
				...full,
				status: "rewarding",
				pipeline: { ...full.pipeline, slots: full.pipeline.configs.length },
				draftOptions: [CONFIGS.eslint],
			})
		);
		expect(offer.refusal).toEqual({ reason: "no-slot" });
	});

	it("marks an offer already installed as owned and unbuyable", () => {
		const owned = only(shopping({ draftOptions: [CONFIGS.js] }));
		expect(owned.owned).toBe(true);
		expect(owned.installable).toBe(false);
	});

	it("marks a held offer without changing what it costs", () => {
		const offer = only(shopping({ lockedOfferIds: ["eslint"] }));
		expect(offer.locked).toBe(true);
		expect(offer.priceKb).toBe(draftCost(CONFIGS.eslint));
	});

	it("previews what installing the offer would do to the build's payouts", () => {
		const state = shopping();
		const offer = only(state);
		const withIt = [...state.pipeline.configs, CONFIGS.eslint];
		expect(offer.preview).toEqual(pipelineModifiersFor(withIt));
		expect(offer.previewPerAnswer).toEqual(
			perAnswerPreviewFor(withIt, state.gatesCleared)
		);
	});
});
