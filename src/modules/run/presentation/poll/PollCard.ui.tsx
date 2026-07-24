import { CategoryCode, getCategoryMetadata } from "~/domains/shared/categories";
import type { AnswerType } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import { PollCodeSandbox } from "~/ui/polls/PollCodeSandbox.ui";
import {
	CodeBlockMarkdown,
	QuestionMarkdown,
} from "~/ui/polls/PollMarkdown.ui";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
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
	canLint?: boolean;
	lintReady?: boolean;
	linter?: Config;
	onLint?: () => void;
	lintCost?: number;
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
	canLint = false,
	lintReady = true,
	linter,
	onLint,
	lintCost,
}: PollCardProps) => {
	return (
		<div {...categoryTheme(category)} className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Swatch size="lg" />
				<Title category={category} as="h1" size="md">
					{getCategoryMetadata(category).name}
				</Title>
			</div>

			<hr className="border-theme border-t" />

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

			{canLint ? (
				<button
					type="button"
					onClick={onLint}

					disabled={!lintReady}
					className="flex items-center gap-2 self-start rounded border border-viridian px-3 py-1 text-xs text-viridian transition enabled:cursor-pointer enabled:hover:bg-viridian enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
				>
					{linter ? <ConfigChip config={linter} /> : null}
					<span>
						Run linter · cross out a wrong answer
						{lintCost === undefined ? "" : ` (${lintCost}KB)`}
					</span>
				</button>
			) : null}

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
