import { getCategoryMetadata } from "~/shared/lib/categories";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import type { AnswerReveal } from "~/modules/run/run/application/answerScore.viewmodel";
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

export type PollSplitView = {
	readonly percentByOptionId: Readonly<Record<string, number>>;
	readonly answeredCount?: number;
};

export type PollCardProps = {
	poll: PollView;
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	reveal?: AnswerReveal;
	split?: PollSplitView;
	correctAnswersThisGate?: number;
	hiddenOptionIds?: readonly string[];
	buyBack?: {
		readonly costKb: number;
		readonly ready: boolean;
		readonly onBuyBack: (optionId: string) => void;
	};
	mirrored?: boolean;
	onSelect: (optionId: string) => void;
};

export const ANSWER_TYPE_HINT: Record<AnswerType, string> = {
	single: "Select exactly one answer",
	multiple: "Select all that apply",
};

export const PollCard = ({
	poll,
	selectedOptionIds = [],
	disabledOptionIds = [],
	reveal,
	split,
	correctAnswersThisGate,
	hiddenOptionIds,
	buyBack,
	mirrored = false,
	onSelect,
}: PollCardProps) => {
	const { category, question, codeBlock, codeSandboxUrl, answerType, options } =
		poll;
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
				correctOptionIds={reveal?.correctOptionIds}
				chosenOptionIds={reveal?.chosenOptionIds ?? []}
				splitPercentByOptionId={split?.percentByOptionId}
				hiddenOptionIds={hiddenOptionIds}
				buyBack={buyBack}
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
