import {
	canLint,
	peekerFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	auditFeeMultiplier,
	auditsFreezeManualEffects,
} from "~/modules/run/gate/domain/audit.model";
import {
	auditsOf,
	liveConfigsOf,
	type RunState,
	withLog,
} from "~/modules/run/run/domain/run.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

const PEEK_COSTS = [32, 64, 128, 256, 512];

export const peekCost = (usesThisGate: number): number =>
	PEEK_COSTS[usesThisGate] ?? PEEK_COSTS[PEEK_COSTS.length - 1];

const wrongStillOn = (state: RunState) => {
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>(state.manualDisabled);
	return poll.options.filter(
		(option) => !option.correct && !alreadyOff.has(option.id)
	);
};

/** The fee ladder times Cost Overrun (ADR-038). Exported so buttons print what the reducer takes. */
export const lintFeeFor = (state: RunState): number =>
	lintCost(state.manualDisabled.length) * auditFeeMultiplier(auditsOf(state));

export const peekFeeFor = (state: RunState): number =>
	peekCost(state.window.peeked ?? 0) * auditFeeMultiplier(auditsOf(state));

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(liveConfigsOf(state), poll.category)) return false;
	// Feature Freeze removes the action rather than pricing it.
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	return wrongStillOn(state).length > 1;
};

export const canRunLinter = (state: RunState): boolean =>
	lintApplies(state) && state.storage >= lintFeeFor(state);

export const spendLint = (state: RunState): RunState => {
	if (!canRunLinter(state)) return state;
	const cost = lintFeeFor(state);
	return {
		...state,
		storage: state.storage - cost,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${cost}KB).`),
	};
};

/** Once per poll: the whole split arrives at once, so a second look would charge for nothing. */
export const peekApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !peekerFor(liveConfigsOf(state))) return false;
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	return !(state.peekedPollIds ?? []).includes(poll.id);
};

export const canBuyPeek = (state: RunState): boolean =>
	peekApplies(state) && state.storage >= peekFeeFor(state);

export const spendPeek = (state: RunState): RunState => {
	if (!canBuyPeek(state)) return state;
	const poll = state.polls[state.currentIndex];
	const cost = peekFeeFor(state);
	return {
		...state,
		storage: state.storage - cost,
		peekedPollIds: [...(state.peekedPollIds ?? []), poll.id],
		window: { ...state.window, peeked: (state.window.peeked ?? 0) + 1 },
		log: withLog(state, `Peeked at the community split (-${cost}KB).`),
	};
};
