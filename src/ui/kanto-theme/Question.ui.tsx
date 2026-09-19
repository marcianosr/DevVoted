import type { ReactNode } from "react";

import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

import { Choice, type ChoiceSeal } from "./Choice.ui";
import { CodeBlock } from "./CodeBlock.ui";
import { Typography } from "./Typography.ui";

const BLOCK = "flex w-full flex-col gap-3";
const CHOICES = "flex w-full flex-col gap-2";

const SEPARATOR = "·";

const ANSWER_TYPE_LABEL = {
	single: "single answer",
	multiple: "multiple answers",
} satisfies Record<AnswerType, string>;

export const questionFactsOf = ({
	options,
	answerType,
}: Pick<QuestionProps, "options" | "answerType">) =>
	`${options.length} options ${SEPARATOR} ${ANSWER_TYPE_LABEL[answerType]}`;

export type QuestionOption = {
	id: string;
	letter: string;
	label?: ReactNode;
	seal?: ChoiceSeal;
	crossedOut?: boolean;
};

export type QuestionProps = {
	answerType: AnswerType;
	question: string;
	options: readonly QuestionOption[];
	codeBlock?: string;
	pickedIds?: readonly string[];
	onPick?: (id: string) => void;
};

export const Question = ({
	answerType,
	question,
	options,
	codeBlock,
	pickedIds = [],
	onPick,
}: QuestionProps) => (
	<section className={BLOCK}>
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
						answerType={answerType}
						picked={picked}
						crossedOut={option.crossedOut}
						onPick={pick}
					>
						{option.label}
					</Choice>
				);
			})}
		</div>
	</section>
);
