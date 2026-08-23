import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const ACTION =
	"inline-flex shrink-0 items-center gap-1.5 rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:border-edge disabled:opacity-40 disabled:hover:bg-transparent";

export type ActionSize = "sm" | "lg";

const SIZE = {
	sm: "px-3 py-1.5",
	lg: "px-6 py-3",
} satisfies Record<ActionSize, string>;

export type ActionEmphasis = "quiet" | "loud" | "prismatic" | "danger";

const EMPHASIS = {
	quiet:
		"border-control-edge text-zinc-100 hover:border-theme hover:bg-theme-soft",
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
	onUse: () => void;
	disabled?: boolean;
};

export type ActionProps = ActionBase &
	({ label: string; cost?: string } | { cost: string; label?: never });

export const Action = (props: ActionProps) => {
	const {
		on,
		icon,
		emphasis = "quiet",
		size = "sm",
		onUse,
		disabled = false,
		cost,
	} = props;
	const label = "label" in props ? props.label : undefined;
	const textSize = size === "lg" ? "body" : "meta";

	return (
		<button
			type="button"
			disabled={disabled}
			// Name computation runs the spans together, and "Use16 KB" is not what
			// anyone reads.
			aria-label={[label, on, cost].filter(Boolean).join(" ")}
			// A nested button is the click's activation target, so a <summary> around
			// it never toggles on its own. stopPropagation is for row handlers that
			// are not summaries.
			onClick={(event) => {
				event.stopPropagation();
				onUse();
			}}
			className={clsx(ACTION, SIZE[size], EMPHASIS[emphasis])}
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
