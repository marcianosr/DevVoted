import { clsx } from "clsx";

import { Swatch, type SwatchFill, type SwatchSize } from "./Swatch.ui";

const TRACK = "flex flex-wrap items-center";

const GAP = {
	small: "gap-1",
	large: "gap-1.5",
	hero: "gap-2",
} satisfies Record<SwatchSize, string>;

const discoveredCountOf = (swatches: readonly SwatchFill[]) =>
	swatches.filter((swatch) => swatch.state !== "undiscovered").length;

export type SwatchTrackProps = {
	swatches: readonly SwatchFill[];
	size?: SwatchSize;
};

export const SwatchTrack = ({ swatches, size = "large" }: SwatchTrackProps) => (
	<div
		role="img"
		aria-label={`${discoveredCountOf(swatches)} of ${swatches.length} swatches discovered`}
		className={clsx(TRACK, GAP[size])}
	>
		{swatches.map((swatch, position) => (
			<Swatch key={position} size={size} {...swatch} />
		))}
	</div>
);
