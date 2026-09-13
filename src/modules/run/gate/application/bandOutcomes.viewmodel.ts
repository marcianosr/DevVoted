import {
	SLICE_WINDOW,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import { signedKbLabel } from "~/shared/lib/storage";

import type {
	BandOutcome,
	BandOutcomesProps,
	LeadPart,
} from "~/ui/kanto-theme/BandOutcomes.ui";
import type {
	CoverageBandId,
	CoverageBarProps,
	CoverageLadder,
} from "~/ui/kanto-theme/CoverageBar.ui";

const AS_PERCENT = 100;
const BELOW_FULL = AS_PERCENT - 1;
const RANGE_DASH = "–";

export const BAND_OUTCOMES_TITLE = "Objectives and rewards";
export const BAND_OUTCOMES_NOTE =
	"Pays land in the run balance when the gate shuts. A peel is paid in KB or in configs.";

const ENDS_THE_RUN = "the run ends";
const PEEL_TRAIL = "peel";

const CLEARING_BAND: CoverageBandId = "ok";

export const outcomesLeadFor = (): readonly LeadPart[] => [
	"Clear at ",
	{ band: CLEARING_BAND },
	" or better and earn the rewards shown below across a window of ",
	{ figure: `${SLICE_WINDOW}` },
	" polls.",
];

const spanLabel = (low: number, high: number) =>
	`${low} ${RANGE_DASH} ${high}%`;

export type BandOutcomesFrame = {
	gateName: string;
	ladder: CoverageLadder;
	coverageGainPercent: number;
	peelKb: number;
	payout: (correct: number) => number;
};

const answersFor = (band: number, gainPercent: number) =>
	gainPercent <= 0
		? SLICE_WINDOW
		: Math.min(SLICE_WINDOW, Math.ceil(band / gainPercent));

export const bandOutcomesFor = ({
	ladder,
	coverageGainPercent,
	peelKb,
	payout,
}: BandOutcomesFrame): BandOutcome[] => {
	const healthy = roundToOneDecimal(ladder.healthy);
	const ok = roundToOneDecimal(ladder.ok);
	const floor = roundToOneDecimal(ladder.floor);
	const pays = (band: number) =>
		signedKbLabel(payout(answersFor(band, coverageGainPercent)));

	return [
		{
			band: "perfect",
			range: `${AS_PERCENT}%`,
			pays: signedKbLabel(payout(SLICE_WINDOW)),
		},
		{
			band: "healthy",
			range: spanLabel(healthy, BELOW_FULL),
			pays: pays(healthy),
		},
		...(ok > healthy - 1
			? []
			: [
					{
						band: "ok" as const,
						range: spanLabel(ok, healthy - 1),
						pays: pays(ok),
					},
				]),
		...(floor > ok - 1
			? []
			: [
					{
						band: "shaky" as const,
						range: spanLabel(floor, ok - 1),
						pays: `${signedKbLabel(-peelKb)} ${PEEL_TRAIL}`,
					},
				]),
		...(floor <= 0
			? []
			: [
					{
						band: "danger" as const,
						range: `under ${floor}%`,
						pays: ENDS_THE_RUN,
					},
				]),
	];
};

export const bandOutcomesPropsFor = (
	frame: BandOutcomesFrame,
	bar: CoverageBarProps
): BandOutcomesProps => {
	const outcomes = bandOutcomesFor(frame);

	return {
		title: BAND_OUTCOMES_TITLE,
		lead: outcomesLeadFor(),
		note: BAND_OUTCOMES_NOTE,
		outcomes,
		bar,
	};
};
