import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

const CAP =
	"flex size-8 shrink-0 items-center justify-center border border-b-4 text-xs leading-none";
const CAP_SHAPE = {
	single: "rounded-full",
	multiple: "rounded-md",
	grid: "rounded-md",
} satisfies Record<AnswerType, string>;
const IDLE = "border-edge-strong bg-theme-raised text-pewter";
const LIT = "border-theme bg-theme-soft text-theme-soft";

export type AnswerState = "idle" | "right" | "wrong";

const ANSWERED = {
	right: "border-theme bg-theme-lit text-zinc-950",
	wrong: "border-theme bg-theme text-white",
} satisfies Record<Exclude<AnswerState, "idle">, string>;

const capToneOf = (lit: boolean, state: AnswerState) => {
	if (state !== "idle") return ANSWERED[state];
	return lit ? LIT : IDLE;
};

export type KeycapProps = {
	letter: string;
	answerType?: AnswerType;
	lit?: boolean;
	state?: AnswerState;
};

export const Keycap = ({
	letter,
	answerType = "single",
	lit = false,
	state = "idle",
}: KeycapProps) => (
	<span className={clsx(CAP, CAP_SHAPE[answerType], capToneOf(lit, state))}>
		{letter}
	</span>
);
