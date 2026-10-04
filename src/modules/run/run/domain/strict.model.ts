import type { Config } from "~/modules/run/config/domain/config.model";
import { wagererFor } from "~/modules/run/build/domain/build.model";
import {
	liveConfigsOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";

export type StrictSettlement = {
	readonly bonus: number;
	readonly loss: number;
};

const NOTHING_AT_STAKE: StrictSettlement = { bonus: 0, loss: 0 };

export const strictStakeOf = (configs: readonly Config[]): number | undefined =>
	wagererFor(configs)?.wagersAnswer;

export const strictSettlementFor = (
	configs: readonly Config[],
	armed: boolean,
	outcome: AnswerOutcome
): StrictSettlement => {
	const stake = strictStakeOf(configs);
	if (!armed || stake === undefined) return NOTHING_AT_STAKE;
	return outcome === "correct"
		? { bonus: stake, loss: 0 }
		: { bonus: 0, loss: stake };
};

export const canArmStrict = (state: RunState): boolean =>
	strictStakeOf(liveConfigsOf(state)) !== undefined;

export const armStrict = (state: RunState): RunState =>
	canArmStrict(state)
		? { ...state, strictArmed: state.strictArmed !== true }
		: state;
