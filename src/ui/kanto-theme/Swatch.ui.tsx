import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Icon, type IconName } from "./Icon.ui";

export type SwatchSize = "small" | "large" | "hero";

export type SwatchFill =
	| { state: "discovered"; swatch: GateSwatch; marked?: boolean }
	| { state: "current"; swatch: GateSwatch }
	| { state: "undiscovered" };

export type SwatchState = SwatchFill["state"];

export type SwatchContent =
	{ count?: number; icon?: never } | { icon?: IconName; count?: never };

export type SwatchMark = SwatchFill & SwatchContent;

export type SwatchGround = "dark" | "bright";

const BASE = "inline-block shrink-0";

const SIZE = {
	small: "size-3.5 rounded-[3px]",
	large: "size-7 rounded-md",
	hero: "size-10 rounded-lg",
} satisfies Record<SwatchSize, string>;

const FILL = {
	discovered: "bg-theme",
	current: "border border-dashed border-theme",
	undiscovered: "bg-theme-raised",
} satisfies Record<SwatchState, string>;

const ON_BRIGHT = {
	discovered: "bg-current",
	current: "border border-dashed border-current",
	undiscovered: "bg-current/25",
} satisfies Record<SwatchState, string>;

const COUNTED = "inline-flex items-center justify-center text-xs leading-none";
const ICON = "size-1/2";

const PLATE = "ring-1 ring-pewter";
const MARK = "legendary-ring";
const PRISMATIC = {
	discovered: "bg-legendary",
	current: "legendary-ring",
} as const;

export type SwatchProps = SwatchFill &
	SwatchContent & {
		size?: SwatchSize;
		ground?: SwatchGround;
	};

const contentOf = ({ count, icon }: SwatchContent): ReactNode => {
	if (icon !== undefined) return <Icon name={icon} className={ICON} />;
	return count;
};

export const swatchFillsFor = (
	swatch: GateSwatch,
	filled: number,
	total: number,
	current = false
): SwatchFill[] =>
	Array.from({ length: total }, (_, position) => {
		if (position < filled) return { state: "discovered", swatch };
		return current ? { state: "current", swatch } : { state: "undiscovered" };
	});

export const Swatch = (props: SwatchProps) => {
	const size = SIZE[props.size ?? "large"];
	const fill = props.ground === "bright" ? ON_BRIGHT : FILL;
	const content = contentOf(props);
	const counted = content === undefined ? undefined : COUNTED;

	if (props.state === "undiscovered") {
		return (
			<span className={clsx(BASE, size, fill.undiscovered, counted)}>
				{content}
			</span>
		);
	}

	if (props.swatch.finish === "fill") {
		return (
			<span className={clsx(BASE, size, PRISMATIC[props.state], counted)}>
				{content}
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
			{content}
		</span>
	);
};
