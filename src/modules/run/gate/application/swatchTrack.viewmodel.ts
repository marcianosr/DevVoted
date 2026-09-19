import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateSwatchAt = (gate: number): GateSwatch => GATE_SWATCHES[gate];

/**
 * The climb ladder as the run actually holds it (ADR-080): a square is filled
 * only where that gate's window came up flawless, never because the run walked
 * past it. `current` marks the gate being played, which is a position and not a
 * prize, so it stays dashed until its five land.
 */
export const swatchTrackFor = (
	earned: readonly number[],
	current?: number
): SwatchFill[] =>
	ALL_SWATCHES.map((swatch, gate) => {
		if (earned.includes(gate)) return { state: "discovered", swatch };
		if (gate === current) return { state: "current", swatch };

		return { state: "undiscovered" };
	});
