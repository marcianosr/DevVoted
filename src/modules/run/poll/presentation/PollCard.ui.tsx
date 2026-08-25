import { CategoryCode, getCategoryMetadata } from "~/shared/lib/categories";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import { PollCodeSandbox } from "~/modules/run/poll/presentation/PollCodeSandbox.ui";
import {
	CodeBlockMarkdown,
	QuestionMarkdown,
} from "~/modules/run/poll/presentation/PollMarkdown.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import {
	PollOption,
	PollOptionList,
} from "~/modules/run/poll/presentation/PollOptionList.ui";

export type { PollOption };

/**
 * A bought community split (Telemetry). `answeredCount` arrives only at level 2,
 * and its absence is load-bearing: without it the bars have no denominator, which
 * is exactly what level 1 sells.
 */
export type PollSplitView = {
	readonly percentByOptionId: Readonly<Record<string, number>>;
	readonly answeredCount?: number;
};

type PollCardProps = {
	category: CategoryCode;
	question: string;
	codeBlock?: string;
	codeSandboxUrl?: string;
	answerType: AnswerType;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	correctOptionIds?: readonly string[];
	chosenOptionIds?: readonly string[];
	split?: PollSplitView;
	/** Correct answers this gate's polls hold (`.length`'s reveal). Absent when
	 * no config is counting. */
	correctAnswersThisGate?: number;
	/** The Mirror is on (ADR-038): the card asks for the incorrect options, and
	 * `.length`'s count reads as the picks this gate actually wants. */
	mirrored?: boolean;
	onSelect: (optionId: string) => void;
};

/** Recap copy for screens that show the answer type as text (e.g. AnswerResults). */
export const ANSWER_TYPE_HINT: Record<AnswerType, string> = {
	single: "Select exactly one answer",
	multiple: "Select all that apply",
};

export const PollCard = ({
	category,
	question,
	codeBlock,
	codeSandboxUrl,
	answerType,
	options,
	selectedOptionIds = [],
	disabledOptionIds = [],
	correctOptionIds,
	chosenOptionIds = [],
	split,
	correctAnswersThisGate,
	mirrored = false,
	onSelect,
}: PollCardProps) => {
	return (
		<div className="flex flex-col gap-2">
			<Paragraph as="h1" size="sm" tone="theme" className="font-bold">
				{getCategoryMetadata(category).name}
			</Paragraph>

			<div className="markdown text-theme text-xl font-extrabold leading-6 tracking-tight sm:text-3xl sm:leading-10">
				<QuestionMarkdown>{question}</QuestionMarkdown>
			</div>

			{codeBlock ? (
				<div className="markdown">
					<CodeBlockMarkdown>{codeBlock}</CodeBlockMarkdown>
				</div>
			) : null}

			{codeSandboxUrl ? <PollCodeSandbox url={codeSandboxUrl} /> : null}

			{/* Loud, and directly above the options: the audit's banner explains the
			    gate, but this is the instruction for the click about to be made. */}
			{mirrored ? (
				<Paragraph as="span" tone="cinnabar" className="font-bold">
					Mirrored — pick every INCORRECT option.
				</Paragraph>
			) : null}

			<PollOptionList
				answerType={answerType}
				options={options}
				selectedOptionIds={selectedOptionIds}
				disabledOptionIds={disabledOptionIds}
				correctOptionIds={correctOptionIds}
				chosenOptionIds={chosenOptionIds}
				splitPercentByOptionId={split?.percentByOptionId}
				onSelect={onSelect}
			/>

			{split?.answeredCount === undefined ? null : (
				<Paragraph as="span" size="xs" tone="muted">
					based on {split.answeredCount} answer
					{split.answeredCount === 1 ? "" : "s"}
				</Paragraph>
			)}

			{correctAnswersThisGate === undefined ? null : (
				<Paragraph as="span" size="xs" tone="muted">
					this gate holds {correctAnswersThisGate}{" "}
					{mirrored ? "incorrect" : "correct"} answer
					{correctAnswersThisGate === 1 ? "" : "s"}
				</Paragraph>
			)}
		</div>
	);
};
