import type { CategoryCode } from "~/domains/shared/categories";
import {
	type AnsweredPoll,
	type AnswerType,
	canRunLinter,
	lintApplies,
	type SessionPoll,
	type SessionState,
	type SessionStatus,
} from "../climb/sessionRun.model";
import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { checkStatuses, gateDemands } from "../gate/gate.model";
import {
	coverageForAnswer,
	linterFor,
	rewardMultiplierFor,
} from "../pipeline/pipeline.model";
import { GATE_REWARD_KB, SLICE_WINDOW, VICTORY_GATE } from "../rules.model";

export type PollOptionView = { readonly id: string; readonly label: string };

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
};

/** Everything a screen needs, and nothing the client shouldn't hold (no answer key, no unseen polls). */
export type SessionView = {
	readonly status: SessionStatus;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	/** Config ids drafted on the open reward screen — shown as "new" pipeline rows. */
	readonly newConfigIds: readonly string[];
	readonly stripsRemaining: number;
	readonly poll: PollView | null;
	/** The lint action is relevant to this poll (show the button). */
	readonly canLint: boolean;
	/** The lint action can be run now — applies and affordable (button enabled). */
	readonly lintReady: boolean;
	/** The linter config powering the lint on the current poll (for its chip). */
	readonly linter: Config | null;
	readonly checks: readonly CheckStatus[];
	/** Polls answered in the current gate window, with results — for the reward summary. */
	readonly answeredThisGate: readonly AnsweredPoll[];
	/** The checks that passed on the last gate clear — for the reward summary. */
	readonly passedChecks: readonly CheckStatus[];
	readonly demands: readonly string[];
	readonly rewardMultiplier: number;
	/** Storage this gate pays on a clear (base × reward multiplier). */
	readonly gateReward: number;
	readonly gatesCleared: number;
	readonly victoryGate: number;
	readonly pollsToGate: number;
	/** Polls answered in the current gate window, and the window size — HUD shows "x/5". */
	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	/** Consecutive correct answers across the run; resets only on a wrong answer. */
	readonly streak: number;
	readonly coverage: number;
	/** Coverage earned per category — gates Focus-config upgrades in the shop. */
	readonly coverageByCategory: Readonly<Record<string, number>>;
	/** Coverage earned per category in the gate just cleared — for the reward summary. */
	readonly coverageGainedThisGate: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly log: readonly string[];
};

/** Coverage earned per category across the gate just cleared, from its answers. */
const gainedThisGate = (state: SessionState): Record<string, number> => {
	const gained: Record<string, number> = {};
	for (const poll of state.answeredThisGate) {
		const earned = coverageForAnswer(
			state.pipeline.configs,
			poll.category,
			poll.correct
		);
		if (earned > 0)
			gained[poll.category] =
				Math.round(((gained[poll.category] ?? 0) + earned) * 10) / 10;
	}
	return gained;
};

const redactPoll = (poll: SessionPoll): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	answerType: poll.answerType,
	options: poll.options.map((option) => ({
		id: option.id,
		label: option.label,
	})),
});

/**
 * The client-safe projection of authoritative state. Strips option correctness and
 * exposes only the current poll (never the upcoming ones), so the client can't cheat.
 */
export const toSessionView = (state: SessionState): SessionView => {
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
