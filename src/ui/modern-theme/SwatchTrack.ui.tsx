import { clsx } from "clsx";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { Swatch, type SwatchState } from "./Swatch.ui";
import { Text } from "./Text.ui";

export type SwatchTrackLayout = "inline" | "stacked";

export type SwatchTrackCounting = "gates" | "swatches";

const TRACK = "flex items-center";

const LAYOUT = {
	inline: "flex-wrap gap-3",
	stacked: "flex-col gap-2",
} satisfies Record<SwatchTrackLayout, string>;

const CELLS = "flex flex-wrap items-center justify-center gap-1.5";

export type SwatchTrackGate = {
	gate: number;
	theme: SwatchTheme;
	finish?: SwatchFinish;
};

export type SwatchTrackAtCleared = Extract<
	SwatchState,
	"current" | "pending" | "locked"
>;

export type SwatchTrackProps = {
	gates: readonly SwatchTrackGate[];
	cleared: number;
	atCleared?: SwatchTrackAtCleared;
	layout?: SwatchTrackLayout;
	counting?: SwatchTrackCounting;
};

const stateFor = (
	gate: number,
	cleared: number,
	atCleared: SwatchTrackAtCleared
): SwatchState => {
	if (gate < cleared) return "earned";
	return gate === cleared ? atCleared : "locked";
};

const showsTheme = (state: SwatchState) =>
	state === "earned" || state === "current";

const describe = (
	gates: readonly SwatchTrackGate[],
	cleared: number,
	atCleared: SwatchTrackAtCleared,
	counting: SwatchTrackCounting
) => {
	if (counting === "swatches") return `${cleared} of ${gates.length} collected`;

	const current = gates[cleared];
	if (atCleared === "current" && current)
		return `gate ${current.gate} / ${gates[gates.length - 1].gate}`;

	return `${cleared} / ${gates.length} gates cleared`;
};

export const SwatchTrack = ({
	gates,
	cleared,
	atCleared = "current",
	layout = "inline",
	counting = "gates",
}: SwatchTrackProps) => (
	<div className={clsx(TRACK, LAYOUT[layout])}>
		<span className={CELLS} aria-hidden="true">
			{gates.map(({ gate, theme, finish }) => {
				const state = stateFor(gate, cleared, atCleared);
				const shown = showsTheme(state);

				return (
					<Swatch
						key={gate}
						size="pip"
						state={state}
						theme={shown ? theme : undefined}
						finish={shown ? finish : undefined}
					/>
				);
			})}
		</span>
		<Text size="meta" tone="muted">
			{describe(gates, cleared, atCleared, counting)}
		</Text>
	</div>
);
