import type { Run } from "~/domains/runs/models/run.model";
import {
	MIN_GATE_FOR_MANUAL_END,
	getActiveGate,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type { ApiResponse } from "~/shared/utils/errorHandling";

export type NavRunState = {
	hasActiveRun: boolean;
	hasPendingPipelineUpgrade: boolean;
	currentGate: number;
	canEndRun: boolean;
};

const EMPTY_STATE: NavRunState = {
	hasActiveRun: false,
	hasPendingPipelineUpgrade: false,
	currentGate: 0,
	canEndRun: false,
};

// Pure derivation of nav-relevant flags from the route's activeRun context.
// Lifted out of <Navigation /> so the component stays readable and the rules
// (gate threshold, "has active run" definition) live in one place.
export const deriveNavRunState = (
	activeRun: ApiResponse<Run | null> | null | undefined
): NavRunState => {
	if (activeRun?.success !== true || !activeRun.data?.id) {
		return EMPTY_STATE;
	}

	const run = activeRun.data;
	const totalPollsAnswered = run.categoryCoverage.reduce(
		(sum, c) => sum + c.pollsAnswered,
		0
	);
	const currentGate = getActiveGate(totalPollsAnswered, run.pipelineSlots);

	return {
		hasActiveRun: true,
		hasPendingPipelineUpgrade: run.pendingUpgradeCards.length > 0,
		currentGate,
		canEndRun: currentGate >= MIN_GATE_FOR_MANUAL_END,
	};
};
