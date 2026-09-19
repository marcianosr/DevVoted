import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { PollScoreRow } from "~/ui/kanto-theme/PollScores.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateRoster: readonly GateSwatch[] = ALL_SWATCHES;

export { gateSwatchAt };

export const trackFor = (
	earned: readonly number[],
	current?: number
): SwatchFill[] => swatchTrackFor(earned, current);

/** A fixture track holding every swatch below `discovered`, standing on it. */
export const trackTo = (discovered: number): SwatchFill[] =>
	trackFor(
		Array.from({ length: discovered }, (_, gate) => gate),
		discovered
	);

export const pollScoreRows = (
	correct: readonly number[],
	polls = 5
): PollScoreRow[] =>
	correct.map((count, gate) => ({
		swatch: gateRoster[gate],
		correct: count,
		polls,
		...(gate === correct.length - 1 ? { current: true } : {}),
	}));

const SINGLE_PAY = 1;

const paidColorOf = (value: number): KantoColor => {
	if (value === 0) return "cinnabar";
	if (value < SINGLE_PAY) return "saffron";
	return "viridian";
};

export const pollPayoutRows = (
	paid: readonly (readonly (number | undefined)[])[]
): PollScoreRow[] =>
	paid.map((slots, gate) => ({
		swatch: gateRoster[gate],
		correct: slots.filter((value) => value !== undefined && value > 0).length,
		polls: slots.length,
		payouts: {
			slots: slots.map((value) =>
				value === undefined
					? undefined
					: { figure: `${value}`, color: paidColorOf(value) }
			),
			total: slots
				.reduce<number>((sum, value) => sum + (value ?? 0), 0)
				.toFixed(1),
		},
		...(gate === paid.length - 1 ? { current: true } : {}),
	}));
