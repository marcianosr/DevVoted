import type { ReactNode } from "react";

import { MarkdownText } from "./PollMarkdown.ui";
import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { PollAnswerReview } from "./PollAnswerReview.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";
import { PollQuestionHeading } from "./PollQuestionHeading.ui";
import { PollScoreSummary } from "./PollScoreSummary.ui";
import type { PollScoreSummaryData } from "./PollScoreSummary.ui";

type ScreenAction = { label: string; onClick: () => void };

type PollResultScreenProps = {
	question: string;
	categoryName: string;
	options: AnswerReviewOption[];
	scoreSummary?: PollScoreSummaryData;
	explanation?: string | null;
	codeSlot?: ReactNode;
	continueAction?: ScreenAction;
	secondaryAction?: ScreenAction;
	pollsUntilGate?: number;
};

const gateCountdownLabel = (pollsUntilGate: number) =>
	`${pollsUntilGate} poll${pollsUntilGate === 1 ? "" : "s"} until the next gate check`;

export const PollResultScreen = ({
	question,
	categoryName,
	options,
	scoreSummary,
	explanation,
	codeSlot,
	continueAction,
	secondaryAction,
	pollsUntilGate,
}: PollResultScreenProps) => {
	const totalCorrect = options.filter((option) => option.correct).length;
	const selectedCorrect = options.filter(
		(option) => option.correct && option.isYours
	).length;
	const isMultipleChoice = totalCorrect > 1;
	const showGateCountdown = pollsUntilGate !== undefined && pollsUntilGate > 0;

	return (
		<div>
			<PollQuestionHeading question={question} />
			{codeSlot}
			<div className="flex flex-col lg:flex-row lg:items-start gap-8">
				<div className="flex-1 min-w-0">
					<div className="flex items-baseline gap-3 mb-1 flex-wrap">
						<h2 className="text-2xl text-theme">Review your answer</h2>
						{isMultipleChoice && (
							<span
								className={
									selectedCorrect === totalCorrect
										? "text-sm text-green-400"
										: "text-sm text-zinc-400"
								}
							>
								{selectedCorrect} of {totalCorrect} correct
							</span>
						)}
					</div>
					<PollAnswerReview options={options} />
				</div>
				{scoreSummary && (
					<div className="w-full lg:w-80 shrink-0">
						<PollScoreSummary {...scoreSummary} categoryName={categoryName} />
					</div>
				)}
			</div>
			{explanation && (
				<div className="mt-8 p-4 border border-zinc-700 bg-zinc-800/40">
					<h3 className="text-lg mb-2">💡 Explanation</h3>
					<div className="markdown text-gray-300">
						<MarkdownText>{explanation}</MarkdownText>
					</div>
				</div>
			)}
			{(continueAction || secondaryAction || showGateCountdown) && (
				<div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
					<span className="text-sm text-gray-400">
						{showGateCountdown ? gateCountdownLabel(pollsUntilGate) : null}
					</span>
					<div className="flex gap-3">
						{secondaryAction && (
							<PrimaryButton onClick={secondaryAction.onClick}>
								{secondaryAction.label}
							</PrimaryButton>
						)}
						{continueAction && (
							<PrimaryButton onClick={continueAction.onClick}>
								{continueAction.label}
							</PrimaryButton>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
