import type { Meta, StoryObj } from "@storybook/react";

import { createKantoQuestionProps } from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Question, type QuestionOption } from "./Question.ui";
import { REDACTED } from "./Redaction.ui";
import { Screen } from "./Screen.ui";

const CODE = `type Settings = {
	theme: string;
	retries: number;
};

const draft = { theme: "kanto" };`;

const SHORT_ANSWERS = [
	{ id: "option-1", letter: "A", label: "map" },
	{ id: "option-2", letter: "B", label: "flatMap" },
	{ id: "option-3", letter: "C", label: "reduce" },
	{ id: "option-4", letter: "D", label: "filter" },
] satisfies QuestionOption[];

const LONG_ANSWERS = [
	{
		id: "option-1",
		letter: "A",
		label:
			"It freezes the object so later writes throw in strict mode, but nested objects stay mutable unless you walk them yourself",
	},
	{
		id: "option-2",
		letter: "B",
		label:
			"It copies every own enumerable property onto a fresh object, so the original is untouched and prototypes are not carried across",
	},
	{
		id: "option-3",
		letter: "C",
		label:
			"It does nothing at runtime; the check is erased when the code compiles",
	},
] satisfies QuestionOption[];

const EIGHT_ANSWERS = "ABCDEFGH".split("").map((letter, index) => ({
	id: `option-${index + 1}`,
	letter,
	label: `Candidate ${letter}`,
})) satisfies QuestionOption[];

const SEALED_ANSWERS = [
	{ id: "option-1", letter: "A", label: "Partial<T>" },
	{ id: "option-2", letter: "B", seal: { price: "4 KB" } },
	{ id: "option-3", letter: "C", seal: { price: "4 KB" } },
] satisfies QuestionOption[];

const meta: Meta<typeof Question> = {
	component: Question,
	title: "Kanto/Question",
	argTypes: {
		answerType: { control: "inline-radio", options: ["single", "multiple"] },
		categoryColor: { control: "select", options: KANTO_COLORS },
		options: { control: "object" },
	},
	args: createKantoQuestionProps(),
	render: (args) => (
		<Screen theme="vermillion">
			<Question {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Question>;

export const Unpicked: Story = {};

export const Picked: Story = { args: { pickedIds: ["option-1"] } };

export const NoWrongCost: Story = { args: { wrongCost: undefined } };

export const MultipleAnswer: Story = {
	args: {
		answerType: "multiple",
		question: "Which of these are TypeScript utility types?",
		options: SHORT_ANSWERS,
		pickedIds: ["option-1", "option-3"],
	},
};

export const ShortAnswers: Story = {
	args: {
		question: "Which array method flattens one level as it maps?",
		options: SHORT_ANSWERS,
	},
};

export const LongAnswers: Story = {
	args: {
		question: "What does Object.freeze actually guarantee?",
		options: LONG_ANSWERS,
		pickedIds: ["option-2"],
	},
};

export const EightOptions: Story = {
	args: {
		question: "Which of these ships in the standard library?",
		options: EIGHT_ANSWERS,
	},
};

export const WithCode: Story = {
	args: {
		question: "What is the inferred type of draft?",
		codeBlock: CODE,
	},
};

export const Sealed: Story = {
	args: {
		question: "Which utility type makes every property optional?",
		options: SEALED_ANSWERS,
	},
};

export const HiddenCategory: Story = {
	args: { category: REDACTED, categoryColor: "pewter" },
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:26rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme}>
					<Question {...createKantoQuestionProps()} pickedIds={["option-1"]} />
				</Screen>
			))}
		</div>
	),
};
