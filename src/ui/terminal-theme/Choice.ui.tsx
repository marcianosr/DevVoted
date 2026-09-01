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

const LETTER =
	"flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-500 text-xs text-zinc-400";

export type ChoiceProps = {
	letter: string;
	label: string;
	state?: ChoiceState;
	note?: ReactNode;
	onPick?: () => void;
};

export const Choice = ({
	letter,
	label,
	state = "idle",
	note,
	onPick,
}: ChoiceProps) => {
	const body = (
		<>
			<span className={LETTER}>{letter}</span>
			<Text className="min-w-0 truncate">{label}</Text>
			{note === undefined ? null : (
				<span className="ml-auto shrink-0">{note}</span>
			)}
		</>
	);

	if (onPick === undefined) {
		return <div className={clsx(CHOICE, STATE[state])}>{body}</div>;
	}

	return (
		<button
			type="button"
			onClick={onPick}
			className={clsx(
				CHOICE,
				STATE[state],
				"transition-colors hover:border-zinc-400"
			)}
		>
			{body}
		</button>
	);
};
