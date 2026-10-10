import { Fragment } from "react";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import {
	splitCodeBlocks,
	splitCodeSpans,
	stripCodeFence,
} from "~/shared/lib/codeSpans";
import { ANSWER_TYPE_LABEL } from "~/shared/lib/copy";

import { Choice, type ChoiceSeal, type ChoiceState } from "./Choice.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import { CodeBlock } from "./CodeBlock.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	whyRight: "Why it’s right",
	whyWrong: "Why it’s wrong",
} as const;

const BLOCK = "flex w-full flex-col gap-3";
const CHOICES = "flex w-full flex-col rounded-lg border border-theme-faint";
const PROSE = "whitespace-pre-line";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const CODE_TEXT = "flex min-w-0 flex-col gap-2";
const VOTES = "w-8 text-right text-xs tabular-nums text-theme-soft";
const VOTER_FACES_SLOT = "flex w-24 justify-end";
const VOTER_FACES = 3;

const EXPLANATION =
	"flex w-full flex-col gap-1 rounded-lg border border-theme-faint px-3 py-2";
const EXPLANATION_HEAD = "flex items-center gap-2";
const EXPLANATION_MARK =
	"badge-theme inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none";
const EXPLANATION_BULB = "size-3.5 text-saffron";

type ExplanationVerdict = "right" | "wrong";

const MARK_COLOR = {
	right: "viridian",
	wrong: "cinnabar",
} satisfies Record<ExplanationVerdict, KantoColor>;

const MARK_GLYPH = {
	right: "✓",
	wrong: "✗",
} satisfies Record<ExplanationVerdict, string>;

const WHY = {
	right: COPY.whyRight,
	wrong: COPY.whyWrong,
} satisfies Record<ExplanationVerdict, string>;

const verdictOf = (right: boolean): ExplanationVerdict =>
	right ? "right" : "wrong";

const SEPARATOR = "·";

export const questionFactsOf = ({
	options,
	answerType,
}: Pick<QuestionProps, "options" | "answerType">) =>
	`${options.length} options ${SEPARATOR} ${ANSWER_TYPE_LABEL[answerType]}`;

export type QuestionVoters = {
	climbers: readonly ClimberProps[];
	count: number;
	overflow?: number;
};

export type OptionExplanation = { text: string; right: boolean };

export type QuestionOption = {
	id: string;
	letter: string;
	label?: string;
	voters?: QuestionVoters;
	seal?: ChoiceSeal;
	crossedOut?: boolean;
	state?: ChoiceState;
	explanation?: OptionExplanation;
};

export type QuestionStem = "full" | "code";

export type QuestionProps = {
	answerType: AnswerType;
	question: string;
	stem?: QuestionStem;
	options: readonly QuestionOption[];
	codeBlock?: string;
	pickedIds?: readonly string[];
	onPick?: (id: string) => void;
};

export const CodeSpans = ({ text }: { text: string }) => (
	<span className={PROSE}>
		{splitCodeSpans(text).map((span, index) =>
			span.kind === "code" ? (
				<code key={`${index}-${span.text}`} className={CODE}>
					{stripCodeFence(span.text)}
				</code>
			) : (
				<Fragment key={`${index}-${span.text}`}>{span.text}</Fragment>
			)
		)}
	</span>
);

export const CodeText = ({ text }: { text: string }) => (
	<span className={CODE_TEXT}>
		{splitCodeBlocks(text).map((part, index) =>
			part.kind === "block" ? (
				<CodeBlock key={`${part.kind}-${index}`} lang={part.lang}>
					{part.code}
				</CodeBlock>
			) : (
				<CodeSpans key={`${part.kind}-${index}`} text={part.text} />
			)
		)}
	</span>
);

const QuestionText = ({
	question,
	stem,
}: {
	question: string;
	stem: QuestionStem;
}) => {
	const parts = splitCodeBlocks(question).filter(
		(part) => stem === "full" || part.kind === "block"
	);
	const heading = parts.findIndex((part) => part.kind === "prose");
	return (
		<>
			{parts.map((part, index) =>
				part.kind === "block" ? (
					<CodeBlock key={`${part.kind}-${index}`} lang={part.lang}>
						{part.code}
					</CodeBlock>
				) : (
					<Typography
						key={`${part.kind}-${index}`}
						variant="headline"
						as={index === heading ? "h1" : "p"}
					>
						<CodeSpans text={part.text} />
					</Typography>
				)
			)}
		</>
	);
};

const Explanation = ({ text, right }: OptionExplanation) => {
	const verdict = verdictOf(right);
	return (
		<span className={EXPLANATION}>
			<span className={EXPLANATION_HEAD}>
				<span
					aria-hidden
					data-screen-theme={MARK_COLOR[verdict]}
					className={EXPLANATION_MARK}
				>
					{MARK_GLYPH[verdict]}
				</span>
				<Icon name="bulb" className={EXPLANATION_BULB} />
				<Typography variant="label" as="span">
					{WHY[verdict]}
				</Typography>
			</span>
			<Typography variant="caption" as="span">
				<CodeSpans text={text} />
			</Typography>
		</span>
	);
};

const Voters = ({ climbers, count, overflow }: QuestionVoters) => (
	<>
		<span className={VOTER_FACES_SLOT}>
			<ClimberStack
				climbers={climbers}
				overflow={overflow}
				shown={VOTER_FACES}
			/>
		</span>
		<span className={VOTES}>{count.toLocaleString()}</span>
	</>
);

export const Question = ({
	answerType,
	question,
	stem = "full",
	options,
	codeBlock,
	pickedIds = [],
	onPick,
}: QuestionProps) => (
	<section className={BLOCK}>
		<QuestionText question={question} stem={stem} />

		{codeBlock === undefined ? null : <CodeBlock>{codeBlock}</CodeBlock>}

		<div data-choices className={CHOICES}>
			{options.map((option) => {
				const picked = pickedIds.includes(option.id);
				const pick = onPick === undefined ? undefined : () => onPick(option.id);

				if (option.seal !== undefined) {
					return (
						<Choice
							key={option.id}
							letter={option.letter}
							answerType={answerType}
							picked={picked}
							onPick={pick}
							seal={option.seal}
						/>
					);
				}

				return (
					<Choice
						key={option.id}
						letter={option.letter}
						answerType={answerType}
						picked={picked}
						crossedOut={option.crossedOut}
						state={option.state}
						onPick={pick}
						aside={
							option.voters === undefined ? undefined : (
								<Voters {...option.voters} />
							)
						}
						note={
							option.explanation === undefined ? undefined : (
								<Explanation {...option.explanation} />
							)
						}
					>
						<CodeText text={option.label ?? ""} />
					</Choice>
				);
			})}
		</div>
	</section>
);
