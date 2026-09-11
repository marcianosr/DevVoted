import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

export const gateRoster: readonly GateSwatch[] = ALL_SWATCHES;

export const gateSwatchAt = (gate: number): GateSwatch => GATE_SWATCHES[gate];

export const trackTo = (discovered: number): SwatchFill[] =>
	gateRoster.map((swatch, position) => {
		if (position < discovered) return { state: "discovered", swatch };
		if (position === discovered) return { state: "current", swatch };
		return { state: "undiscovered" };
	});
