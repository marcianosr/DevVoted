import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Swatch, type SwatchSize, swatchFillsFor } from "./Swatch.ui";

const ROW = "flex flex-wrap items-center gap-x-2 gap-y-1.5";
const GATE = "flex items-center gap-1";

const SWATCH_SIZE: SwatchSize = "small";

export type CodebaseGate = {
	swatch: GateSwatch;
	covered: number;
	slots: number;
	current?: boolean;
};

export type CodebaseProps = {
	gates: readonly CodebaseGate[];
	label: string;
};

export const Codebase = ({ gates, label }: CodebaseProps) => (
	<div role="img" aria-label={label} className={ROW}>
		{gates.map(({ swatch, covered, slots, current }) => (
			<span key={swatch.gate} className={GATE}>
				{swatchFillsFor(swatch, covered, slots, current).map(
					(fill, position) => (
						<Swatch key={position} size={SWATCH_SIZE} {...fill} />
					)
				)}
			</span>
		))}
	</div>
);
