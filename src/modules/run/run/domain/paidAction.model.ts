import { canLint, peekerFor } from "~/modules/run/build/domain/build.model";
import {
	auditFeeMultiplier,
	auditPaidActionLimit,
	auditsFreezeManualEffects,
	BUY_BACK_KB,
} from "~/modules/run/gate/domain/audit.model";
import {
	auditsOf,
	hiddenOptionIdsOf,
	liveConfigsOf,
	type RunState,
	withLog,
} from "~/modules/run/run/domain/run.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

export const lintCost = (usesThisGate: number): number =>
	LINT_COSTS[usesThisGate] ?? LINT_COSTS[LINT_COSTS.length - 1];

const PEEK_COSTS = [32, 64, 128, 256, 512];

export const peekCost = (usesThisGate: number): number =>
	PEEK_COSTS[usesThisGate] ?? PEEK_COSTS[PEEK_COSTS.length - 1];

/**
 * Redacted options are excluded, not merely skipped: `disabledOptionIds` ships
 * to the client, so crossing one out would state that a sealed option is wrong
 * — the leak the redaction exists to prevent. It also makes the linter walk the
 * sealed set for free, since the pick is the first wrong option in poll order.
 */
const wrongStillOn = (state: RunState) => {
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>(state.manualDisabled);
	const sealed = new Set(hiddenOptionIdsOf(state));
	return poll.options.filter(
		(option) =>
			!option.correct && !alreadyOff.has(option.id) && !sealed.has(option.id)
	);
};

export const lintFeeFor = (state: RunState): number =>
	lintCost(state.window.linted ?? 0) * auditFeeMultiplier(auditsOf(state));

export const peekFeeFor = (state: RunState): number =>
	peekCost(state.window.peeked ?? 0) * auditFeeMultiplier(auditsOf(state));

const paidActionsUsed = (state: RunState): number =>
	(state.window.linted ?? 0) + (state.window.peeked ?? 0);

const rateLimited = (state: RunState): boolean => {
	const limit = auditPaidActionLimit(auditsOf(state));
	return limit !== undefined && paidActionsUsed(state) >= limit;
};

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(liveConfigsOf(state), poll.category)) return false;
	// Feature Freeze removes the action rather than pricing it.
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	if (rateLimited(state)) return false;
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
		window: { ...state.window, linted: (state.window.linted ?? 0) + 1 },
		log: withLog(state, `Ran the linter (-${cost}KB).`),
	};
};

/** Once per poll: the whole split arrives at once, so a second look would charge for nothing. */
export const peekApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !peekerFor(liveConfigsOf(state))) return false;
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	if (rateLimited(state)) return false;
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

export const buyBackFeeFor = (state: RunState): number =>
	BUY_BACK_KB * auditFeeMultiplier(auditsOf(state));

/**
 * Flat, and outside every meter: not the 429 allowance, not the 403 freeze, no
 * ladder. 451 hands out the problem, so it always hands out the answer — a seal
 * with no way to read it is a trap rather than a rule, and that has to hold
 * however the seal arrived. The fee is charged per option, not per gate, so a
 * ladder would price the escape hatch out of reach.
 */
export const buyBackApplies = (state: RunState, optionId: string): boolean =>
	hiddenOptionIdsOf(state).includes(optionId);

export const canBuyBack = (state: RunState, optionId: string): boolean =>
	buyBackApplies(state, optionId) && state.storage >= buyBackFeeFor(state);

export const spendBuyBack = (state: RunState, optionId: string): RunState => {
	if (!canBuyBack(state, optionId)) return state;
	const cost = buyBackFeeFor(state);
	return {
		...state,
		storage: state.storage - cost,
		boughtBackOptionIds: [...(state.boughtBackOptionIds ?? []), optionId],
		log: withLog(state, `Bought back a redacted answer (-${cost}KB).`),
	};
};
