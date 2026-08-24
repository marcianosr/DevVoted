import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const ACTION =
	"inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:border-edge disabled:opacity-40 disabled:hover:bg-transparent";

export type ActionSize = "sm" | "lg";

const SIZE = {
	sm: "px-3 py-1.5",
	lg: "px-6 py-3",
} satisfies Record<ActionSize, string>;

const FULL = "w-full justify-center";

export type ActionEmphasis = "quiet" | "loud" | "prismatic" | "danger";

const EMPHASIS = {
	// Filled, not outlined: quiet is the default, so it lands in rows where every
	// neighbour is a label and an outline alone did not read as pressable.
	quiet:
		"border-control-edge bg-surface-raised text-zinc-100 hover:border-theme hover:bg-theme-soft",
	loud: "border-celadon bg-celadon/10 text-celadon hover:bg-celadon/20",
	prismatic:
		"border-transparent legendary-ring text-zinc-100 hover:brightness-125",
	danger: "border-cinnabar text-cinnabar hover:bg-cinnabar/10",
} satisfies Record<ActionEmphasis, string>;

type ActionBase = {
	on?: string;
	icon?: ReactNode;
	emphasis?: ActionEmphasis;
	size?: ActionSize;
	full?: boolean;
	onUse: () => void;
	disabled?: boolean;
	expanded?: boolean;
};

export type ActionProps = ActionBase &
	({ label: string; cost?: string } | { cost: string; label?: never });

export const Action = (props: ActionProps) => {
	const {
		on,
		icon,
		emphasis = "quiet",
		size = "sm",
		full = false,
		onUse,
		disabled = false,
		expanded,
		cost,
	} = props;
	const label = "label" in props ? props.label : undefined;
	const textSize = size === "lg" ? "body" : "meta";

	return (
		<button
			type="button"
			disabled={disabled}
			aria-expanded={expanded}
			aria-label={[label, on, cost].filter(Boolean).join(" ")}
			onClick={(event) => {
				event.stopPropagation();
				onUse();
			}}
			className={clsx(ACTION, SIZE[size], EMPHASIS[emphasis], full && FULL)}
		>
			{icon}
			{label ? (
				<Text size={textSize} tone="inherit">
					{label}
				</Text>
			) : null}
			{cost ? (
				<Text size={textSize} tone="inherit">
					{cost}
				</Text>
			) : null}
		</button>
	);
};
