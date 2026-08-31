import type { Config } from "~/modules/run/config/domain/config.model";
import { linterFor, peekerFor } from "~/modules/run/build/domain/build.model";
import {
	canBuyPeek,
	canRunLinter,
	lintApplies,
	lintFeeFor,
	peekApplies,
	peekFeeFor,
} from "~/modules/run/run/domain/paidAction.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

/** `can*` is whether the action applies at all, `*Ready` whether the run can pay. */
export type PaidActions = {
	readonly canLint: boolean;
	readonly lintReady: boolean;
	readonly lintCost: number;
	readonly linter: Config | null;
	readonly canPeek: boolean;
	readonly peekReady: boolean;
	readonly peekCost: number;
	readonly peeker: Config | null;
};

export const paidActionsFor = (state: RunState): PaidActions => {
	const current = state.polls[state.currentIndex];
	return {
		canLint: lintApplies(state),
		lintReady: canRunLinter(state),
		lintCost: lintFeeFor(state),
		linter:
			current === undefined
				? null
				: (linterFor(state.build.configs, current.category) ?? null),
		canPeek: peekApplies(state),
		peekReady: canBuyPeek(state),
		peekCost: peekFeeFor(state),
		peeker: peekerFor(state.build.configs) ?? null,
	};
};
