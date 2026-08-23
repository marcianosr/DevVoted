import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const ACTION =
	"inline-flex shrink-0 items-center gap-1.5 rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed disabled:border-edge disabled:opacity-40 disabled:hover:bg-transparent";

export type ActionSize = "sm" | "lg";

// lg is for a screen's one way forward, not for a shelf of them: it has to win
// against a whole panel of figures above it.
const SIZE = {
	sm: "px-3 py-1.5",
	lg: "px-6 py-3",
} satisfies Record<ActionSize, string>;

export type ActionEmphasis = "quiet" | "loud" | "prismatic" | "danger";

// border-control-edge is the token for "something you can click". Loud is the
// one action a shelf wants you to take, so it borrows the gain colour rather
// than the gate's, which every other control on the screen already wears.
// Prismatic is the live shop's own name for a met requirement (ADR-024's
// legendary ring), kept so the two surfaces do not invent separate words.
// Danger is the only one that colours a whole button red: a price is not a
// warning, but taking a config back out of the build is.
const EMPHASIS = {
	quiet:
		"border-control-edge text-zinc-100 hover:border-theme hover:bg-theme-soft",
	loud: "border-celadon bg-celadon/10 text-celadon hover:bg-celadon/20",
	prismatic:
		"border-transparent legendary-ring text-zinc-100 hover:brightness-125",
	danger: "border-cinnabar text-cinnabar hover:bg-cinnabar/10",
} satisfies Record<ActionEmphasis, string>;

type ActionBase = {
	/** Names what is being acted on, so a column of these is not all "Use 16 KB". */
	on?: string;
	/** A glyph before the label, for a control that repeats rather than buys. */
	icon?: ReactNode;
	emphasis?: ActionEmphasis;
	size?: ActionSize;
	onUse: () => void;
	disabled?: boolean;
};

// A button says what it does, what it costs, or both — never neither.
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
			// Spelled out rather than left to the spans below: name computation runs
			// them together, and "Use16 KB" is not what anyone reads.
			aria-label={[label, on, cost].filter(Boolean).join(" ")}
			// A nested button is the click's activation target, so a <summary> around
			// it never toggles on its own. stopPropagation is for the row handlers
			// that are not summaries.
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
