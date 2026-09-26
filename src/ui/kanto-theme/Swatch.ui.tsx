import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

export type SwatchSize = "small" | "large" | "hero";

export type SwatchFill =
	| { state: "discovered"; swatch: GateSwatch; marked?: boolean }
	| { state: "current"; swatch: GateSwatch }
	| { state: "undiscovered" };

export type SwatchState = SwatchFill["state"];

export type SwatchMark = SwatchFill & { count?: number };

export type SwatchGround = "dark" | "bright";

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

const ON_BRIGHT = {
	discovered: "bg-current",
	current: "border-2 border-dashed border-current",
	undiscovered: "bg-current/25",
} satisfies Record<SwatchState, string>;

const COUNTED = "inline-flex items-center justify-center text-xs leading-none";

const PLATE = "ring-1 ring-pewter";
const MARK = "legendary-ring";
const PRISMATIC = {
	discovered: "bg-legendary",
	current: "legendary-ring",
} as const;

export type SwatchProps = SwatchFill & {
	size?: SwatchSize;
	ground?: SwatchGround;
	count?: number;
};

export const Swatch = (props: SwatchProps) => {
	const size = SIZE[props.size ?? "large"];
	const fill = props.ground === "bright" ? ON_BRIGHT : FILL;
	const counted = props.count === undefined ? undefined : COUNTED;

	if (props.state === "undiscovered") {
		return (
			<span className={clsx(BASE, size, fill.undiscovered, counted)}>
				{props.count}
			</span>
		);
	}

	if (props.swatch.finish === "fill") {
		return (
			<span className={clsx(BASE, size, PRISMATIC[props.state], counted)}>
				{props.count}
			</span>
		);
	}

	return (
		<span
			data-swatch-theme={props.swatch.theme}
			className={clsx(
				BASE,
				size,
				fill[props.state],
				props.swatch.finish === "plate" && PLATE,
				props.state === "discovered" && props.marked === true && MARK,
				counted
			)}
		>
			{props.count}
		</span>
	);
};
