import type { Meta, StoryObj } from "@storybook/react";

import type { CategoryCode } from "~/shared/lib/categories";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	switchArm,
	type Config,
} from "~/modules/run/config/domain/config.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { RevealView } from "~/modules/run/run/presentation/RevealView.component";
import { RewardView } from "~/modules/run/gate/presentation/RewardView.component";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";

const noop = () => {};

const meta: Meta = {
	title: "Terminal/Configs in action",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj;

const QUESTION_BANK = {
	js: {
		question: "Which method returns the last element of an array?",
		right: "at(-1)",
		wrongs: ["pop()", "last()"],
	},
	ts: {
		question: "Which type means 'any value except null/undefined'?",
		right: "NonNullable<T>",
		wrongs: ["Partial<T>", "Readonly<T>"],
	},
	css: {
		question: "Which centers a flex item on both axes?",
		right: "place-items: center",
		wrongs: ["align: middle", "float: center"],
	},
	react: {
		question: "What key should list items get?",
		right: "A stable unique id",
		wrongs: ["The array index", "Math.random()"],
	},
} satisfies Partial<
	Record<CategoryCode, { question: string; right: string; wrongs: string[] }>
>;

type BankCategory = keyof typeof QUESTION_BANK;

const single = (id: string, category: BankCategory): RunPoll => {
	const bank = QUESTION_BANK[category];
	return {
		id,
		category,
		question: bank.question,
		answerType: "single",
		options: [
			{ id: `${id}-r`, label: bank.right, correct: true },
			...bank.wrongs.map((label, index) => ({
				id: `${id}-${index}`,
				label,
				correct: false,
			})),
		],
	};
};

const pollsOf = (categories: readonly BankCategory[]): RunPoll[] =>
	categories.map((category, index) => single(`${category}-${index}`, category));

const runWith = (
	configs: readonly Config[],
	categories: readonly BankCategory[],
	startAtGate = 0
): RunState => {
	const base = createRun(pollsOf(categories), [...configs], startAtGate);
	return runReducer(
		{
			...base,
			build: {
				...base.build,
				slots: Math.max(BASE_SLOTS, occupiedSlots(configs)),
				configs: [...configs],
			},
		},
		{ type: "start" }
	);
};

const funded = (state: RunState, storage: number): RunState => ({
	...state,
	storage,
});

const answerNext = (state: RunState, correct: boolean): RunState => {
	const poll = state.polls[state.currentIndex];
	if (!poll) return state;
	const picked = correct
		? poll.options.filter((option) => option.correct).map((option) => option.id)
		: poll.options
				.filter((option) => !option.correct)
				.slice(0, 1)
				.map((option) => option.id);
	return runReducer(state, { type: "answer", optionIds: picked });
};

const afterAnswers = (
	state: RunState,
	outcomes: readonly boolean[]
): RunState => outcomes.reduce(answerNext, state);

const ALL_RIGHT = [true, true, true, true, true];

const asPoll = (state: RunState, split?: Readonly<Record<string, number>>) => {
	const view = toRunView(state, 0);
	if (!view.poll) return <p>no poll to show</p>;
	return (
		<PollView
			view={view}
			poll={view.poll}
			selectedOptionIds={[]}
			splitByOptionId={split}
			onSelect={noop}
			onSubmit={noop}
			onLint={noop}
			onPeek={noop}
			onBuyBack={noop}
		/>
	);
};

const asReveal = (state: RunState) => {
	const view = toRunView(state, 0);
	const answered = view.answeredThisGate.at(-1);
	if (!answered) return <p>nothing answered yet</p>;
	return <RevealView view={view} answered={answered} onNext={noop} />;
};

const asShop = (state: RunState) => (
	<ShopView
		view={toRunView(state, 0)}
		onDraft={noop}
		onSell={noop}
		onUpgrade={noop}
		onSwitchArm={noop}
		onLock={noop}
		onUnlock={noop}
		onRebuild={noop}
		onExtend={noop}
		onPlantPin={noop}
		onBuySlot={noop}
		onCashSlot={noop}
		onSetStoragePlan={noop}
		onContinue={noop}
	/>
);

const asReward = (state: RunState) => (
	<RewardView
		view={toRunView(state, 0)}
		onReviewAnswers={noop}
		onContinue={noop}
	/>
);

const asPrep = (state: RunState) => (
	<PrepView
		view={toRunView(state, 0)}
		onStart={noop}
		onBackToShop={noop}
		onCommunity={noop}
		onRebase={noop}
		onEstimate={noop}
	/>
);

const estimating = (state: RunState, count: number): RunState =>
	runReducer(state, { type: "estimate", count });

const JS_GATE = ["js", "js", "js", "js", "js"] as const;
const MIXED_GATE = ["js", "css", "ts", "react", "js"] as const;

export const FocusPaysItsCategory: Story = {
	render: () =>
		asPoll(runWith([CONFIGS.js, CONFIGS.ts, CONFIGS.css], MIXED_GATE)),
};

export const FocusWaitsItsCategory: Story = {
	render: () =>
		asPoll(
			runWith(
				[
					CONFIGS.js,
					CONFIGS.ts,
					CONFIGS.css,
					CONFIGS.jsx,
					CONFIGS.git,
					CONFIGS.rb,
					CONFIGS.html,
					CONFIGS.java,
					CONFIGS.py,
					CONFIGS.frontend,
					CONFIGS.vue,
				],
				JS_GATE
			)
		),
};

export const LintersSellCrossouts: Story = {
	render: () =>
		asPoll(
			funded(runWith([CONFIGS.eslint, CONFIGS.stylelint], MIXED_GATE), 64)
		),
};

export const TelemetryPeeksTheSplit: Story = {
	render: () => {
		const state = runReducer(
			funded(runWith([CONFIGS.telemetry], MIXED_GATE), 128),
			{ type: "peek-poll" }
		);
		const poll = state.polls[state.currentIndex];
		const split = Object.fromEntries(
			(poll?.options ?? []).map((option, index) => [
				option.id,
				[62, 27, 11][index] ?? 0,
			])
		);
		return asPoll(state, split);
	},
};

export const LengthCountsTheGate: Story = {
	render: () => asPoll(runWith([CONFIGS.length], MIXED_GATE)),
};

export const PrefetchReadsAhead: Story = {
	render: () =>
		asPrep(
			afterAnswers(
				runWith([CONFIGS.prefetch], [...MIXED_GATE, ...JS_GATE]),
				ALL_RIGHT
			)
		),
};

export const PlanningPokerTakesTheBet: Story = {
	render: () =>
		asPrep(
			estimating(
				afterAnswers(
					runWith([CONFIGS.planningPoker], [...MIXED_GATE, ...JS_GATE]),
					ALL_RIGHT
				),
				4
			)
		),
};

export const PlanningPokerCarriesTheBetIntoTheGate: Story = {
	render: () => {
		const prepped = estimating(
			afterAnswers(
				runWith([CONFIGS.planningPoker], [...MIXED_GATE, ...JS_GATE]),
				ALL_RIGHT
			),
			4
		);
		return asPoll(
			afterAnswers(runReducer(prepped, { type: "finish-reward" }), [true, true])
		);
	},
};

export const PlanningPokerPaysTheExactCall: Story = {
	render: () => {
		const prepped = estimating(
			afterAnswers(
				runWith([CONFIGS.planningPoker], [...MIXED_GATE, ...JS_GATE]),
				ALL_RIGHT
			),
			5
		);
		return asReward(
			afterAnswers(runReducer(prepped, { type: "finish-reward" }), ALL_RIGHT)
		);
	},
};

export const CacheColdOnFirstSight: Story = {
	render: () => asPoll(runWith([CONFIGS.cache], JS_GATE)),
};

export const CacheWarmPaysTheRepeat: Story = {
	render: () =>
		asReveal(
			afterAnswers(runWith([CONFIGS.cache], JS_GATE), [true, true, true])
		),
};

export const CacheFlushesOnWrong: Story = {
	render: () =>
		asPoll(
			afterAnswers(runWith([CONFIGS.cache], JS_GATE), [true, true, true, false])
		),
};

export const ColdStartDoublesTheOpener: Story = {
	render: () => asPoll(runWith([CONFIGS.coldStart], MIXED_GATE)),
};

export const OverclockBurnsTheOpener: Story = {
	render: () =>
		asReveal(afterAnswers(runWith([CONFIGS.overclock], MIXED_GATE), [true])),
};

export const OverclockRunsHotAfter: Story = {
	render: () =>
		asPoll(afterAnswers(runWith([CONFIGS.overclock], MIXED_GATE), [true])),
};

export const AmplifiersStack: Story = {
	render: () =>
		asPoll(
			runWith(
				[CONFIGS.intellisense, CONFIGS.agentsMd, CONFIGS.codeCoverage],
				MIXED_GATE
			)
		),
};

export const IndexedDbDripsStorage: Story = {
	render: () =>
		asReveal(afterAnswers(runWith([CONFIGS.indexedDb], MIXED_GATE), [true])),
};

export const AbTestShipsArmA: Story = {
	render: () => asPoll(runWith([CONFIGS.abTest], MIXED_GATE)),
};

export const AbTestArmBDripsStorage: Story = {
	render: () =>
		asReveal(
			afterAnswers(runWith([switchArm(CONFIGS.abTest)], MIXED_GATE), [true])
		),
};

export const AbTestSwitchesInTheShop: Story = {
	render: () =>
		asShop(
			afterAnswers(runWith([CONFIGS.abTest, CONFIGS.js], JS_GATE), ALL_RIGHT)
		),
};

export const GateClearPaysTheEconomy: Story = {
	render: () =>
		asReward(
			afterAnswers(
				funded(runWith([CONFIGS.unitTests, CONFIGS.mooresLaw], JS_GATE), 200),
				ALL_RIGHT
			)
		),
};

export const DependabotMergesAnUpgrade: Story = {
	render: () =>
		asReward(
			afterAnswers(
				runWith([CONFIGS.dependabot, CONFIGS.js], JS_GATE),
				ALL_RIGHT
			)
		),
};

export const DependabotCountsDown: Story = {
	render: () =>
		asPoll(
			afterAnswers(runWith([CONFIGS.dependabot, CONFIGS.js], JS_GATE), [
				true,
				true,
				true,
			])
		),
};

export const DependabotResetsOnAWrongAnswer: Story = {
	render: () =>
		asPoll(
			afterAnswers(runWith([CONFIGS.dependabot, CONFIGS.js], JS_GATE), [
				true,
				true,
				false,
			])
		),
};

export const DeprecatedFadesOnClear: Story = {
	render: () =>
		asShop(
			afterAnswers(
				runWith([CONFIGS.deprecated, CONFIGS.js], JS_GATE),
				ALL_RIGHT
			)
		),
};

export const FreemiumBillsTheClear: Story = {
	render: () =>
		asReward(
			afterAnswers(runWith([CONFIGS.freemium, CONFIGS.js], JS_GATE), ALL_RIGHT)
		),
};

export const FreemiumHalvesTheShelf: Story = {
	render: () =>
		asShop(
			afterAnswers(runWith([CONFIGS.freemium, CONFIGS.js], JS_GATE), ALL_RIGHT)
		),
};

export const YarnLockHoldsAnOffer: Story = {
	render: () => {
		const shop = funded(
			afterAnswers(runWith([CONFIGS.yarnLock, CONFIGS.js], JS_GATE), ALL_RIGHT),
			256
		);
		return asShop(
			runReducer(shop, {
				type: "lock-offer",
				configId: shop.draftOptions[0].id,
			})
		);
	},
};

export const WtfplOpensEveryShop: Story = {
	render: () =>
		asShop(
			afterAnswers(
				funded(runWith([CONFIGS.wtfpl, CONFIGS.js], JS_GATE), 512),
				ALL_RIGHT
			)
		),
};

export const WtfplVoidsTheWarranty: Story = {
	render: () =>
		asShop(
			afterAnswers(runWith([CONFIGS.wtfpl, CONFIGS.js], JS_GATE), ALL_RIGHT)
		),
};

export const VolkswagenGreensTheAudit: Story = {
	render: () =>
		asPoll(runWith([CONFIGS.volkswagenCi, CONFIGS.js], MIXED_GATE, 3)),
};

const underAudit = (state: RunState, ...ids: AuditId[]): RunState => ({
	...state,
	auditSchedule: { ...state.auditSchedule, [state.gatesCleared]: ids },
});

const heldRun = (configs: readonly Config[] = [CONFIGS.js]): RunState =>
	funded(underAudit(runWith(configs, MIXED_GATE, 8), "legal-hold"), 128);

/**
 * The gate seals answers rather than a config doing it. These polls carry three
 * options, and the readable floor keeps two of them legible, so exactly one is
 * sealed — the audit never reduces a poll to a coin flip.
 */
export const LegalHoldSealsAnAnswer: Story = {
	render: () => asPoll(heldRun()),
};

export const LegalHoldSellsTheAnswerBack: Story = {
	render: () => {
		const held = heldRun();
		const [sealed] = toRunView(held, 0).hiddenOptionIds;
		if (!sealed) return <p>nothing sealed</p>;
		return asPoll(
			runReducer(held, { type: "buy-back-option", optionId: sealed })
		);
	},
};

/**
 * The linter goes quiet. It may not cross out a sealed answer — that would say
 * the answer is wrong for less than the gate charges to read it — and it never
 * crosses out the last legible wrong one, so on a three-option poll holding one
 * seal it has no legal move and stops offering itself. Buy the seal back and it
 * wakes up.
 */
export const LegalHoldSilencesTheLinter: Story = {
	render: () => asPoll(heldRun([CONFIGS.js, CONFIGS.eslint])),
};
