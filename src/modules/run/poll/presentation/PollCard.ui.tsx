import { CategoryCode, getCategoryMetadata } from "~/shared/lib/categories";
import type { AnswerType } from "~/modules/run/run/domain/run.model";
import { PollCodeSandbox } from "~/modules/run/poll/presentation/PollCodeSandbox.ui";
import {
	CodeBlockMarkdown,
	QuestionMarkdown,
} from "~/modules/run/poll/presentation/PollMarkdown.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { TextTone } from "~/ui/typography/textTone";
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
	/** Picks the gate's budget still has before this poll's selection (.length).
	 * Absent when no config is counting. */
	pickBudgetLeft?: number;
	onSelect: (optionId: string) => void;
};

/**
 * The live budget line for `.length`. It has to count the *tentative* selection,
 * not the submitted one, because the decision it exists to inform is being made
 * right now: the pipeline row can only report picks already spent.
 */
const pickBudgetNote = (
	left: number,
	selectedCount: number
): { readonly text: string; readonly tone: TextTone } => {
	const remaining = left - selectedCount;
	if (remaining < 0)
		return {
			text: `${-remaining} pick${remaining === -1 ? "" : "s"} over budget`,
			tone: "cinnabar",
		};
	if (remaining === 0) return { text: "budget spent", tone: "saffron" };
	return {
		text: `${remaining} pick${remaining === 1 ? "" : "s"} left this gate`,
		tone: "muted",
	};
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
	pickBudgetLeft,
	onSelect,
}: PollCardProps) => {
	const budgetNote =
		pickBudgetLeft === undefined
			? undefined
			: pickBudgetNote(pickBudgetLeft, selectedOptionIds.length);

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

			{budgetNote ? (
				<Paragraph as="span" size="xs" tone={budgetNote.tone}>
					{budgetNote.text}
				</Paragraph>
			) : null}
		</div>
	);
};
