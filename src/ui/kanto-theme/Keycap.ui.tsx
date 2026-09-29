import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

const CAP =
	"flex size-8 shrink-0 items-center justify-center border border-b-4 text-xs leading-none";
const CAP_SHAPE = {
	single: "rounded-full",
	multiple: "rounded-md",
} satisfies Record<AnswerType, string>;
const IDLE = "border-edge-strong bg-theme-raised text-pewter";
const LIT = "border-theme bg-theme-soft text-theme-soft";

export type KeycapProps = {
	letter: string;
	answerType?: AnswerType;
	lit?: boolean;
};

export const Keycap = ({
	letter,
	answerType = "single",
	lit = false,
}: KeycapProps) => (
	<span className={clsx(CAP, CAP_SHAPE[answerType], lit ? LIT : IDLE)}>
		{letter}
	</span>
);
