import { cva } from "class-variance-authority";

import type { AnswerOutcome, AnswerType } from "~/modules/run/climb/run.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";

/**
 * Read-only replay of a poll's option list: every option with a checkbox
 * (multiple) or radio (single) control, the correct set revealed in green,
 * your wrong picks in red.
 */
type ReviewStatus = "correct" | "pickedWrong" | "neutral";

const reviewRow = cva("flex items-center gap-3 rounded-md border px-4 py-2.5", {
	variants: {
		status: {
			correct: "border-viridian/60 bg-viridian/10",
			pickedWrong: "border-cinnabar/60 bg-cinnabar/10",
			neutral: "border-zinc-700",
		} satisfies Record<ReviewStatus, string>,
	},
});

const reviewControl = cva(
	"flex h-4 w-4 shrink-0 items-center justify-center border-2 text-[10px]",
	{
		variants: {
			status: {
				correct: "border-viridian bg-viridian text-black",
				pickedWrong: "border-cinnabar bg-cinnabar text-black",
				neutral: "border-pewter",
			} satisfies Record<ReviewStatus, string>,
			shape: {
				single: "rounded-full",
				multiple: "rounded",
			} satisfies Record<AnswerType, string>,
		},
	}
);

const LABEL_TONE = {
	correct: "viridian",
	pickedWrong: "cinnabar",
	neutral: "default",
} as const;

const MARK: Record<ReviewStatus, string> = {
	correct: "✓",
	pickedWrong: "✕",
	neutral: "",
};

type PollOptionReviewProps = {
	options: readonly string[];
	picked: readonly string[];
	correct?: readonly string[];
	answerType?: AnswerType;
	outcome: AnswerOutcome;
};

const statusOf = (
	option: string,
	{ picked, correct, outcome }: PollOptionReviewProps
): ReviewStatus => {
	if (correct !== undefined) {
		if (correct.includes(option)) return "correct";
		return picked.includes(option) ? "pickedWrong" : "neutral";
	}
	// Legacy snapshots lack the correct set — color picks by the poll outcome.
	if (!picked.includes(option)) return "neutral";
	return outcome === "correct" ? "correct" : "pickedWrong";
};

export const PollOptionReview = (props: PollOptionReviewProps) => {
	const { options, answerType = "single" } = props;

	return (
		<div className="flex flex-col gap-2">
			{options.map((option) => {
				const status = statusOf(option, props);
				return (
					<div key={option} className={reviewRow({ status })}>
						<span className={reviewControl({ status, shape: answerType })}>
							{status === "neutral" ? "" : "✓"}
						</span>
						<Paragraph as="span" size="sm" tone={LABEL_TONE[status]}>
							{option}
						</Paragraph>
						<Paragraph
							as="span"
							size="sm"
							tone={LABEL_TONE[status]}
							className="ml-auto"
						>
							{MARK[status]}
						</Paragraph>
					</div>
				);
			})}
		</div>
	);
};
