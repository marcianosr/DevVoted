import type { ReactNode } from "react";

import { clsx } from "clsx";

import { CURSOR_BLOCKED, CURSOR_PICKABLE } from "./cursors";
import { Dot } from "./Dot.ui";
import type { MarkVariant } from "./Mark.ui";
import { Subtitle } from "./Subtitle.ui";
import type { SkinTone } from "./tones";

const CRUMB = "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5";

// Only the current crumb is boxed: the ring is the "you are here", and a trail
// where every crumb had one would say nothing.
const CURRENT = "border border-theme text-theme";
const ANSWERED = "border border-transparent text-zinc-100";
const DISABLED = "border border-transparent text-pewter italic";

const VERDICT_TONE = {
	pass: "viridian",
	part: "saffron",
	fail: "cinnabar",
	skip: "muted",
	run: "theme",
} as const satisfies Record<MarkVariant, SkinTone>;

type CrumbBase = {
	label: ReactNode;
	suffix?: ReactNode;
	onSelect?: () => void;
};

export type CrumbProps = CrumbBase &
	(
		| { state: "answered"; verdict: MarkVariant }
		| { state: "current"; verdict?: never }
		| { state: "disabled"; verdict?: never }
	);

const STATE = {
	answered: ANSWERED,
	current: CURRENT,
	disabled: DISABLED,
} as const satisfies Record<CrumbProps["state"], string>;

export const Crumb = ({ label, state, verdict, onSelect }: CrumbProps) => {
	const blocked = state === "disabled";
	const pickable = Boolean(onSelect) && !blocked;

	const body = (
		<>
			{state === "current" ? <Dot tone="theme" hollow /> : null}
			{verdict ? <Dot tone={VERDICT_TONE[verdict]} /> : null}
			<span className="text-[10px]">{label}</span>
		</>
	);

	const className = clsx(
		CRUMB,
		STATE[state],
		blocked && CURSOR_BLOCKED,
		pickable && CURSOR_PICKABLE
	);

	if (!onSelect) {
		return (
			<span
				className={className}
				aria-current={state === "current" ? "step" : undefined}
			>
				{body}
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={onSelect}
			disabled={blocked}
			aria-current={state === "current" ? "step" : undefined}
			className={className}
		>
			{body}
		</button>
	);
};
