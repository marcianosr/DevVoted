import type { CategoryCode } from "~/domains/shared/categories";
import {
	type AnsweredPoll,
	type AnswerType,
	canRunLinter,
	lintApplies,
	type RunPoll,
	type RunState,
	type RunStatus,
} from "../climb/run.model";
import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { checkStatuses, gateDemands } from "../gate/gate.model";
import {
	coverageForAnswer,
	coverageProfileFor,
	linterFor,
	rewardMultiplierFor,
} from "../pipeline/pipeline.model";
import {
	GATE_REWARD_KB,
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "../rules.model";

export type PollOptionView = { readonly id: string; readonly label: string };

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
};

export type RunView = {
	readonly status: RunStatus;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly newConfigIds: readonly string[];
	readonly stripsRemaining: number;
	readonly poll: PollView | null;
	readonly canLint: boolean;
	readonly lintReady: boolean;
	readonly linter: Config | null;
	readonly checks: readonly CheckStatus[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly passedChecks: readonly CheckStatus[];
	readonly demands: readonly string[];
	readonly rewardMultiplier: number;
	readonly coverageMultiplier: number;
	readonly coverageAdd: number;
	readonly gateReward: number;
	readonly gatesCleared: number;
	readonly victoryGate: number;
	readonly pollsToGate: number;
	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly coverageGainedThisGate: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly log: readonly string[];
};

const gainedThisGate = (state: RunState): Record<string, number> => {
	const gained: Record<string, number> = {};
	for (const poll of state.answeredThisGate) {
		const earned = coverageForAnswer(
			state.pipeline.configs,
			poll.category,
			poll.outcome === "correct"
		);
		if (earned > 0)
			gained[poll.category] = roundToOneDecimal(
				(gained[poll.category] ?? 0) + earned
			);
	}
	return gained;
};

const redactPoll = (poll: RunPoll): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	answerType: poll.answerType,
	options: poll.options.map((option) => ({
		id: option.id,
		label: option.label,
	})),
});

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	return {
		status: state.status,
		slots: state.pipeline.slots,
		configs: state.pipeline.configs,
		available: state.available,
		draftOptions: state.draftOptions,
		newConfigIds: state.draftedThisGate,
		stripsRemaining: state.stripsRemaining,
		poll: state.status === "answering" && current ? redactPoll(current) : null,
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		linter:
			current === undefined
				? null
				: (linterFor(state.pipeline.configs, current.category) ?? null),
		checks: checkStatuses(state.pipeline, state.window, state.gatesCleared),
		answeredThisGate: state.answeredThisGate,
		passedChecks: state.clearedChecks,
		demands: gateDemands(state.pipeline, state.gatesCleared),
		rewardMultiplier: rewardMultiplierFor(state.pipeline),
		coverageMultiplier: coverageProfileFor(state.pipeline).mult,
		coverageAdd: coverageProfileFor(state.pipeline).add,
		gateReward: Math.round(
			GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
		),
		gatesCleared: state.gatesCleared,
		victoryGate: VICTORY_GATE,
		pollsToGate: SLICE_WINDOW - state.window.answered,
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		streak: state.streak,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		coverageGainedThisGate: gainedThisGate(state),
		storage: state.storage,
		log: state.log,
	};
};
