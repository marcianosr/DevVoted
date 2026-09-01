import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Swatch, type SwatchSize, type SwatchState } from "./Swatch.ui";

export type TrackSwatch = {
	theme?: SwatchTheme;
	state: SwatchState;
};

export type SwatchTrackProps = {
	swatches: readonly TrackSwatch[];
	size?: SwatchSize;
};

export const SwatchTrack = ({ swatches, size = "pip" }: SwatchTrackProps) => (
	<span aria-hidden className="flex flex-wrap items-center gap-1.5">
		{swatches.map((swatch, index) => (
			<Swatch
				key={`${swatch.theme ?? swatch.state}-${index}`}
				theme={swatch.theme}
				state={swatch.state}
				size={size}
			/>
		))}
	</span>
);
