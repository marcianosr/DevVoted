import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

export type ChoiceState = "idle" | "expected" | "dimmed";

const CHOICE =
	"flex w-full items-center gap-3 rounded-lg border px-4 py-2 text-left";

const STATE = {
	idle: "border-edge-strong",
	expected: "border-viridian/60",
	dimmed: "border-edge opacity-50",
} satisfies Record<ChoiceState, string>;

const SELECTED = "border-theme bg-theme-soft";

const LETTER =
	"flex size-6 shrink-0 items-center justify-center rounded-full border text-xs";
const LETTER_IDLE = "border-zinc-500 text-zinc-400";
const LETTER_SELECTED = "border-theme bg-theme-soft text-zinc-100";

const frameFor = (state: ChoiceState, selected: boolean) => {
	if (state !== "idle") return STATE[state];
	return selected ? SELECTED : STATE.idle;
};

export type ChoiceProps = {
	letter: string;
	label: string;
	state?: ChoiceState;
	selected?: boolean;
	note?: ReactNode;
	onPick?: () => void;
};

export const Choice = ({
	letter,
	label,
	state = "idle",
	selected = false,
	note,
	onPick,
}: ChoiceProps) => {
	const frame = frameFor(state, selected);
	const body = (
		<>
			<span
				className={clsx(
					LETTER,
					selected && state === "idle" ? LETTER_SELECTED : LETTER_IDLE
				)}
			>
				{letter}
			</span>
			<Text className="min-w-0 truncate">{label}</Text>
			{note === undefined ? null : (
				<span className="ml-auto shrink-0">{note}</span>
			)}
		</>
	);

	if (onPick === undefined) {
		return <div className={clsx(CHOICE, frame)}>{body}</div>;
	}

	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onPick}
			className={clsx(
				CHOICE,
				frame,
				"cursor-pointer transition-colors hover:border-zinc-400"
			)}
		>
			{body}
		</button>
	);
};
