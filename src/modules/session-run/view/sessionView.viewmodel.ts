import type { CategoryCode } from "~/domains/shared/categories";
import type {
	AnswerType,
	SessionPoll,
	SessionState,
	SessionStatus,
} from "../climb/sessionRun.model";
import type { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { checkStatuses, gateDemands } from "../gate/gate.model";
import { rewardMultiplierFor } from "../pipeline/pipeline.model";
import { GATE_REWARD_KB, SLICE_WINDOW, VICTORY_GATE } from "../rules.model";

/** A poll option as the client sees it — no `correct` flag. */
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
	readonly checks: readonly CheckStatus[];
	readonly demands: readonly string[];
	readonly rewardMultiplier: number;
	/** Storage this gate pays on a clear (base × reward multiplier). */
	readonly gateReward: number;
	readonly gatesCleared: number;
	readonly victoryGate: number;
	readonly pollsToGate: number;
	readonly coverage: number;
	readonly storage: number;
	readonly log: readonly string[];
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
		checks: checkStatuses(state.pipeline, state.window, state.gatesCleared),
		demands: gateDemands(state.pipeline, state.gatesCleared),
		rewardMultiplier: rewardMultiplierFor(state.pipeline),
		gateReward: Math.round(
			GATE_REWARD_KB * rewardMultiplierFor(state.pipeline)
		),
		gatesCleared: state.gatesCleared,
		victoryGate: VICTORY_GATE,
		pollsToGate: SLICE_WINDOW - state.window.answered,
		coverage: state.coverage,
		storage: state.storage,
		log: state.log,
	};
};
