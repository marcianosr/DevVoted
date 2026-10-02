import {
	type CoverageBandId,
	percentOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type GateClosing,
	type GateHoldReason,
	type GateLadder,
	gateLadderFor,
} from "~/modules/run/gate/domain/gate.model";
import {
	closesOf,
	type RecordedClose,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";

export type GateCloseView = {
	readonly gate: number;
	readonly closing: GateClosing;
	readonly heldBy: GateHoldReason | null;
	readonly band: CoverageBandId;
	readonly cleared: boolean;
	readonly held: number;
	readonly ladder: GateLadder;
	readonly correct: number;
	readonly kb: number;
	readonly unlockedConfigIds: readonly string[];
	readonly earnedTitleIds: readonly string[];
};

const latestCloseOf = (state: RunState): RecordedClose | undefined =>
	closesOf(state).at(-1) ??
	(state.lastClose === undefined
		? undefined
		: { ...state.lastClose, kb: state.gateRewardKb ?? 0 });

const closingOf = (state: RunState, close: RecordedClose): GateClosing => {
	if (close.closing !== undefined) return close.closing;
	if (close.cleared) return "cleared";
	return state.status === "dead" ? "fatal" : "held";
};

const heldByOf = (
	state: RunState,
	close: RecordedClose,
	closing: GateClosing
): GateHoldReason | null => {
	if (closing !== "held") return null;
	return close.heldBy ?? state.heldBy ?? null;
};

const correctOf = (state: RunState): number =>
	state.answeredThisGate.filter((poll) => poll.outcome === "correct").length;

const LINE_OF_BAND: Readonly<
	Record<CoverageBandId, (ladder: GateLadder) => number>
> = {
	perfect: () => percentOf(1),
	healthy: (ladder) => ladder.healthy,
	ok: (ladder) => ladder.ok,
	shaky: (ladder) => ladder.floor,
	danger: () => 0,
};

export const gateCloseViewOf = (state: RunState): GateCloseView | null => {
	const close = latestCloseOf(state);
	if (close === undefined) return null;
	const closing = closingOf(state, close);
	const ladder =
		close.ladder ??
		gateLadderFor(state.build.configs, close.gate, scheduleOf(state));

	return {
		gate: close.gate,
		closing,
		heldBy: heldByOf(state, close, closing),
		band: close.band,
		cleared: close.cleared,
		held: close.held ?? LINE_OF_BAND[close.band](ladder),
		ladder,
		correct: close.correct ?? correctOf(state),
		kb: close.kb,
		unlockedConfigIds: close.unlockedConfigIds ?? [],
		earnedTitleIds: close.earnedTitleIds ?? [],
	};
};
