import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	gateSwatchAt,
	swatchTrackTo,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { PollScoreRow } from "~/ui/kanto-theme/PollScores.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateRoster: readonly GateSwatch[] = ALL_SWATCHES;

export { gateSwatchAt };

export const trackTo = (discovered: number): SwatchFill[] =>
	swatchTrackTo(discovered);

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
