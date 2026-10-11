import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

const CAP = "flex shrink-0 items-center justify-center border leading-none";
const CAP_SIZE = {
	regular: "size-8 border-b-4 text-xs",
	fit: "size-6 border-b-2 text-[10px] sm:size-8 sm:border-b-4 sm:text-xs",
} as const;

export type KeycapSize = keyof typeof CAP_SIZE;
const CAP_SHAPE = {
	single: "rounded-full",
	multiple: "rounded-md",
	pairs: "rounded-md",
} satisfies Record<AnswerType, string>;
const IDLE = "border-edge-strong bg-theme-raised text-pewter";
const LIT = "border-theme bg-theme-soft text-theme-soft";

export type AnswerState = "idle" | "right" | "wrong";

const ANSWERED = {
	right: "border-theme bg-theme-lit text-zinc-950",
	wrong: "border-theme bg-theme text-white",
} satisfies Record<Exclude<AnswerState, "idle">, string>;

const FILLED = "border-theme bg-theme-lit text-zinc-950";

const capToneOf = (lit: boolean, filled: boolean, state: AnswerState) => {
	if (state !== "idle") return ANSWERED[state];
	if (filled) return FILLED;
	return lit ? LIT : IDLE;
};

export type KeycapProps = {
	letter: string;
	answerType?: AnswerType;
	lit?: boolean;
	filled?: boolean;
	state?: AnswerState;
	size?: KeycapSize;
};

export const Keycap = ({
	letter,
	answerType = "single",
	lit = false,
	filled = false,
	state = "idle",
	size = "regular",
}: KeycapProps) => (
	<span
		data-cap
		className={clsx(
			CAP,
			CAP_SIZE[size],
			CAP_SHAPE[answerType],
			capToneOf(lit, filled, state)
		)}
	>
		{letter}
	</span>
);
