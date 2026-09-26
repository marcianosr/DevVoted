import {
	type CommittableBand,
	type CoverageBand,
	SLA_UPLIFT,
	meetsBand,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { type RunState, isPrepPhase } from "~/modules/run/run/domain/run.model";

export const SLA_BANDS: readonly CommittableBand[] = [
	"ok",
	"healthy",
	"perfect",
];

export const committerFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.commitsBand === true);

export const canCommitBand = (state: Pick<RunState, "status">): boolean =>
	isPrepPhase(state);

/** Whether the build still owes this gate a promise. Reads like `estimateOwed`. */
export const bandOwed = (state: RunState): boolean =>
	committerFor(state.build.configs) !== undefined &&
	canCommitBand(state) &&
	state.slaBand === undefined;

const isCommittableBand = (band: string): band is CommittableBand =>
	SLA_BANDS.some((candidate) => candidate === band);

export const commitBand = (state: RunState, band: string): RunState => {
	if (!canCommitBand(state)) return state;
	if (committerFor(state.build.configs) === undefined) return state;
	if (!isCommittableBand(band)) return state;
	return { ...state, slaBand: band };
};

/**
 * A floor, like Planning Poker's: closing above the promised band still pays.
 * The rate is read off the band COMMITTED to rather than the one landed in,
 * which is the whole decision — promise PERFECT and land HEALTHY and the
 * agreement pays nothing, where a promise of OK would have paid.
 *
 * Only a clear reaches here, so SHAKY and DANGER pay nothing by construction:
 * there is no payout for a percentage of.
 */
export const slaUpliftKb = (
	configs: readonly Config[],
	committed: CommittableBand | undefined,
	closed: CoverageBand,
	clearKb: number
): number => {
	if (committerFor(configs) === undefined || committed === undefined) return 0;
	if (!meetsBand(closed, committed)) return 0;
	return Math.round(clearKb * SLA_UPLIFT[committed]);
};
