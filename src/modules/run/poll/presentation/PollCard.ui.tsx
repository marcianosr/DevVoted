import { CategoryCode, getCategoryMetadata } from "~/shared/lib/categories";
import type { AnswerType } from "~/modules/run/run/domain/run.model";
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

			<PollOptionList
				answerType={answerType}
				options={options}
				selectedOptionIds={selectedOptionIds}
				disabledOptionIds={disabledOptionIds}
				correctOptionIds={correctOptionIds}
				chosenOptionIds={chosenOptionIds}
				onSelect={onSelect}
			/>
		</div>
	);
};
