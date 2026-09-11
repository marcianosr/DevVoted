import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

export type SwatchSize = "small" | "large" | "hero";

export type SwatchFill =
	| { state: "discovered"; swatch: GateSwatch }
	| { state: "current"; swatch: GateSwatch }
	| { state: "undiscovered" };

export type SwatchState = SwatchFill["state"];

const BASE = "inline-block shrink-0";

const SIZE = {
	small: "size-3.5 rounded-xs",
	large: "size-7 rounded-md",
	hero: "size-10 rounded-lg",
} satisfies Record<SwatchSize, string>;

const FILL = {
	discovered: "bg-theme",
	current: "border-2 border-dashed border-theme bg-theme-raised",
	undiscovered: "bg-theme-raised",
} satisfies Record<SwatchState, string>;

const PLATE = "ring-1 ring-pewter";
const PRISMATIC = {
	discovered: "bg-legendary",
	current: "legendary-ring",
} as const;

export type SwatchProps = SwatchFill & { size?: SwatchSize };

export const Swatch = (props: SwatchProps) => {
	const size = SIZE[props.size ?? "large"];

	if (props.state === "undiscovered") {
		return <span className={clsx(BASE, size, FILL.undiscovered)} />;
	}

	if (props.swatch.finish === "fill") {
		return <span className={clsx(BASE, size, PRISMATIC[props.state])} />;
	}

	return (
		<span
			data-swatch-theme={props.swatch.theme}
			className={clsx(
				BASE,
				size,
				FILL[props.state],
				props.swatch.finish === "plate" && PLATE
			)}
		/>
	);
};
