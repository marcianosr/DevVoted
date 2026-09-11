import type { ReactNode } from "react";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import { Badge } from "./Badge.ui";
import { Choice, type ChoiceSeal } from "./Choice.ui";
import { CodeBlock } from "./CodeBlock.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const BLOCK = "flex w-full flex-col gap-3";
const FACTS_ROW = "flex flex-wrap items-center gap-3";
const WRONG_COST = "flex items-center gap-2 sm:ml-auto";
const CHOICES = "flex w-full flex-col gap-2";

const SEPARATOR = "·";
const WRONG_COST_WORDS = "wrong costs";
const WRONG_COST_COLOR = "cinnabar";

const ANSWER_TYPE_LABEL = {
	single: "single answer",
	multiple: "multiple answers",
} satisfies Record<AnswerType, string>;

const factsOf = (count: number, answerType: AnswerType) =>
	`${count} options ${SEPARATOR} ${ANSWER_TYPE_LABEL[answerType]}`;

export type QuestionOption = {
	id: string;
	letter: string;
	label?: ReactNode;
	seal?: ChoiceSeal;
};

export type QuestionProps = {
	category: string;
	answerType: AnswerType;
	question: string;
	options: readonly QuestionOption[];
	codeBlock?: string;
	pickedIds?: readonly string[];
	onPick?: (id: string) => void;
	categoryColor?: KantoColor;
	wrongCost?: string;
};

export const Question = ({
	category,
	answerType,
	question,
	options,
	codeBlock,
	pickedIds = [],
	onPick,
	categoryColor,
	wrongCost,
}: QuestionProps) => (
	<section className={BLOCK}>
		<div className={FACTS_ROW}>
			<Badge color={categoryColor}>{category}</Badge>
			<Typography variant="hint" as="span">
				{factsOf(options.length, answerType)}
			</Typography>
			{wrongCost === undefined ? null : (
				<span className={WRONG_COST}>
					<Typography variant="hint" as="span">
						{WRONG_COST_WORDS}
					</Typography>
					<Badge color={WRONG_COST_COLOR}>{wrongCost}</Badge>
				</span>
			)}
		</div>

		<Typography variant="headline">{question}</Typography>

		{codeBlock === undefined ? null : <CodeBlock>{codeBlock}</CodeBlock>}

		<div className={CHOICES}>
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
						picked={picked}
						onPick={pick}
					>
						{option.label}
					</Choice>
				);
			})}
		</div>
	</section>
);
