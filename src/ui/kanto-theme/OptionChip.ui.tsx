import { clsx } from "clsx";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import type { KantoColor } from "./colors";

const CHIP =
	"inline-flex w-fit items-center gap-2 rounded-lg border px-2 py-1 text-sm whitespace-nowrap";
const OUTLINE = "border-theme text-theme-faint";
const FILLED = "badge-theme border-transparent";

const CAP =
	"flex size-5 shrink-0 items-center justify-center border text-[10px] font-bold";
const CAP_SHAPE = {
	single: "rounded-full",
	multiple: "rounded-md",
} satisfies Record<AnswerType, string>;
const CAP_OUTLINE = "border-theme text-theme";
const CAP_FILLED = "border-theme-soft text-theme-soft";

export type OptionChipProps = {
	letter: string;
	label: string;
	answerType?: AnswerType;
	color?: KantoColor;
	filled?: boolean;
};

export const OptionChip = ({
	letter,
	label,
	answerType = "single",
	color,
	filled = false,
}: OptionChipProps) => (
	<span
		data-screen-theme={color}
		className={clsx(CHIP, filled ? FILLED : OUTLINE)}
	>
		<span
			aria-hidden
			className={clsx(
				CAP,
				CAP_SHAPE[answerType],
				filled ? CAP_FILLED : CAP_OUTLINE
			)}
		>
			{letter}
		</span>
		{label}
	</span>
);
