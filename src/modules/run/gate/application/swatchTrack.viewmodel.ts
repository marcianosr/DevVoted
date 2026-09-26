import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateSwatchAt = (gate: number): GateSwatch => GATE_SWATCHES[gate];

const GATE_WORD = "gate";

export const gateLabelOf = (gate: number): string =>
	`${GATE_WORD} ${gate} · ${gateSwatchAt(gate).gateName}`;

export const swatchTrackFor = (
	earned: readonly number[],
	current?: number
): SwatchFill[] =>
	ALL_SWATCHES.map((swatch, gate) => {
		if (earned.includes(gate)) return { state: "discovered", swatch };
		if (gate === current) return { state: "current", swatch };

		return { state: "undiscovered" };
	});
