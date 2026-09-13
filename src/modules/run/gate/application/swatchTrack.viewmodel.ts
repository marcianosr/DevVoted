import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateSwatchAt = (gate: number): GateSwatch => GATE_SWATCHES[gate];

export const swatchTrackTo = (discovered: number): SwatchFill[] =>
	ALL_SWATCHES.map((swatch, position) => {
		if (position < discovered) return { state: "discovered", swatch };
		if (position === discovered) return { state: "current", swatch };
		return { state: "undiscovered" };
	});
