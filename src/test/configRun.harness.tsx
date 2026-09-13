import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import { createRun, type RunState } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import type { CategoryCode } from "~/shared/lib/categories";

import { StartView } from "~/modules/run/build/presentation/StartView.component";
import {
	GateOutcomeView,
	type GateVerdict,
} from "~/modules/run/gate/presentation/GateOutcomeView.component";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";

const noop = () => {};

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

export type BankCategory = keyof typeof QUESTION_BANK;

export const JS_GATE = ["js", "js", "js", "js", "js"] as const;
export const MIXED_GATE = ["js", "css", "ts", "react", "js"] as const;
export const CSS_GATE = ["css", "css", "css", "css", "css"] as const;
export const ALL_RIGHT = [true, true, true, true, true];

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

/**
 * Sets `build.configs` directly so a story can show a build the shop's install
 * caps would never deal, then starts the run so the window opens for real.
 */
export const runWith = (
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

export const funded = (state: RunState, storage: number): RunState => ({
	...state,
	storage,
});

export const underAudit = (state: RunState, ...ids: AuditId[]): RunState => ({
	...state,
	auditSchedule: { ...state.auditSchedule, [state.gatesCleared]: ids },
});

export const dispatching = (
	state: RunState,
	...actions: readonly RunAction[]
): RunState => actions.reduce(runReducer, state);

export const answerNext = (state: RunState, correct: boolean): RunState => {
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

export const afterAnswers = (
	state: RunState,
	outcomes: readonly boolean[]
): RunState => outcomes.reduce(answerNext, state);

export const asPoll = (state: RunState) => {
	const view = toRunView(state, 0);
	if (!view.poll) return <p>no poll to show</p>;
	return (
		<PollView
			view={view}
			selectedOptionIds={[]}
			onSelect={noop}
			onSubmit={noop}
			onNext={noop}
			onPress={noop}
			onUnseal={noop}
		/>
	);
};

export const asAnswered = (state: RunState) => {
	const view = toRunView(state, 0);
	const answered = view.answeredThisGate.at(-1);
	if (!answered) return <p>nothing answered yet</p>;
	return (
		<PollView
			view={view}
			answered={answered}
			selectedOptionIds={[]}
			onSelect={noop}
			onSubmit={noop}
			onNext={noop}
		/>
	);
};

export const asPrep = (state: RunState) => (
	<PrepView view={toRunView(state, 0)} onStart={noop} onBackToShop={noop} />
);

export const asShop = (state: RunState) => (
	<ShopView
		view={toRunView(state, 0)}
		onDraft={noop}
		onSell={noop}
		onUpgrade={noop}
		onRebuild={noop}
		onExtend={noop}
		onPlantPin={noop}
		onBuySlot={noop}
		onCashSlot={noop}
		onSetStoragePlan={noop}
		onContinue={noop}
	/>
);

export const asGateOutcome = (
	state: RunState,
	verdict: GateVerdict = "cleared"
) => (
	<GateOutcomeView
		view={toRunView(state, 0)}
		verdict={verdict}
		onReview={noop}
		onNext={noop}
	/>
);

export const asReview = (state: RunState) => (
	<ReviewView
		view={toRunView(state, 0)}
		back={{ label: "Back to the gate", onUse: noop }}
	/>
);

export const asStart = (state: RunState) => (
	<StartView
		view={toRunView(state, 0)}
		onToggle={noop}
		onBuySlot={noop}
		onRefundSlot={noop}
		onStart={noop}
	/>
);
