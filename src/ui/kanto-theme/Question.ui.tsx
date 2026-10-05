import { Fragment, type ReactNode } from "react";

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
import { Typography } from "./Typography.ui";

const BLOCK = "flex w-full flex-col gap-3";
const CHOICES = "flex w-full flex-col rounded-lg border border-theme-faint";
const PROSE = "whitespace-pre-line";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const VOTES = "w-8 text-right text-xs tabular-nums text-theme-soft";
const VOTER_FACES_SLOT = "flex w-24 justify-end";
const VOTER_FACES = 3;

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

export type QuestionOption = {
	id: string;
	letter: string;
	label?: ReactNode;
	voters?: QuestionVoters;
	seal?: ChoiceSeal;
	crossedOut?: boolean;
	state?: ChoiceState;
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
					>
						{option.label}
					</Choice>
				);
			})}
		</div>
	</section>
);
