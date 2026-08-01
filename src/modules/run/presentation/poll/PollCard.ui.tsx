import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import type { AnswerType } from "~/modules/run/climb/run.model";
import { PollCodeSandbox } from "~/ui/polls/PollCodeSandbox.ui";
import {
	CodeBlockMarkdown,
	QuestionMarkdown,
} from "~/ui/polls/PollMarkdown.ui";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { PollOption, PollOptionList } from "./PollOptionList.ui";

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
		<div {...categoryTheme(category)} className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<Swatch size="sm" />
				<Paragraph as="h1" size="sm" tone="theme" className="font-bold">
					{getCategoryMetadata(category).name}
				</Paragraph>
			</div>

			{/* The question is authored markdown, so code examples render highlighted
			    (react-markdown + rehype-highlight) while inheriting the themed
			    heading look from the wrapper. */}
			<div className="markdown text-theme text-xl font-extrabold leading-6 tracking-tight sm:text-3xl sm:leading-8">
				<QuestionMarkdown>{question}</QuestionMarkdown>
			</div>

			{/* Some questions ship a separate code_block column; render it as a
			    highlighted fenced block at body size, not the heading style above. */}
			{codeBlock ? (
				<div className="markdown">
					<CodeBlockMarkdown>{codeBlock}</CodeBlockMarkdown>
				</div>
			) : null}

			{/* Others reference a live CodeSandbox instead of a static snippet. */}
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
