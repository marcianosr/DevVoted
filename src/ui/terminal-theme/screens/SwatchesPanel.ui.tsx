import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { REDACTED } from "../Redacted.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";

const GRID = "grid grid-cols-6 gap-3 py-2 @max-md:grid-cols-3";
const TILE = "flex flex-col gap-2";

export type EarnedSwatch = {
	id: string;
	earned?: true;
	name: string;
	theme: SwatchTheme;
	finish?: SwatchFinish;
};

/** The colour is the collectible, so an unearned swatch shows neither it nor
 * the gate name that shares it. */
export type UnearnedSwatch = {
	id: string;
	earned: false;
	name?: never;
	theme?: never;
	finish?: never;
};

export type DexSwatch = EarnedSwatch | UnearnedSwatch;

export type SwatchesPanelProps = { swatches: readonly DexSwatch[] };

const isEarned = (swatch: DexSwatch): swatch is EarnedSwatch =>
	swatch.earned !== false;

const SwatchTile = ({ swatch }: { swatch: DexSwatch }) => {
	const earned = isEarned(swatch);

	return (
		<div className={TILE}>
			<Swatch
				size="card"
				theme={earned ? swatch.theme : undefined}
				finish={earned ? swatch.finish : undefined}
				state={earned ? "earned" : "pending"}
			/>
			<Text tone={earned ? "default" : "faint"} size="caption">
				{earned ? swatch.name : REDACTED}
			</Text>
		</div>
	);
};

export const SwatchesPanel = ({ swatches }: SwatchesPanelProps) => (
	<div className={GRID}>
		{swatches.map((swatch) => (
			<SwatchTile key={swatch.id} swatch={swatch} />
		))}
	</div>
);
