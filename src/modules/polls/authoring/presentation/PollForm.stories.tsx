import type { Meta, StoryObj } from "@storybook/react";

import {
	CATEGORY_CHOICES,
	EMPTY_POLL_FORM,
	STATUS_CHOICES,
	answerRowsOf,
	canAddAnswer,
	canRemoveAnswer,
	UNPLAYED,
	pickInPreview,
	previewCategoryOf,
	previewOf,
	questionCountOf,
	refusalOf,
	stepsDoneOf,
	withAnswerType,
	type PollFormState,
	type PollFormView,
} from "~/modules/polls/authoring/application/pollForm.viewmodel";
import { APPROVED_POLL_REWARD } from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
	PollForm,
	type PollFormProps,
} from "~/modules/polls/authoring/presentation/PollForm.ui";

const noop = () => {};

const FILLED: PollFormState = {
	...EMPTY_POLL_FORM,
	question: "What does this log?\n```js\nconsole.log(0.1 + 0.2 === 0.3)\n```",
	categoryCode: "js",
	answers: [
		{ key: 0, text: "true", right: false },
		{ key: 1, text: "false", right: true },
		{ key: 2, text: "undefined", right: false },
		{ key: 3, text: "a `TypeError`", right: false },
	],
	explanation:
		"Binary floating point cannot hold 0.1 or 0.2 exactly, so the sum lands a hair above 0.3.",
};

const SEVERAL: PollFormState = {
	...withAnswerType(FILLED, "multiple"),
	question: "Which of these create a new stacking context?",
	answers: [
		{ key: 0, text: "`position: fixed`", right: true },
		{ key: 1, text: "`opacity: 0.5`", right: true },
		{ key: 2, text: "`display: block`", right: false },
		{ key: 3, text: "`z-index: auto`", right: false },
	],
};

const propsFor = (
	state: PollFormState,
	overrides: Partial<PollFormProps> = {}
): PollFormProps => ({
	mode: "suggest",
	state,
	view: "write",
	rows: answerRowsOf(state),
	questionCount: questionCountOf(state.question),
	steps: stepsDoneOf(state),
	preview: previewOf(state),
	previewCategory: previewCategoryOf(state),
	categories: CATEGORY_CHOICES,
	reward: APPROVED_POLL_REWARD,
	refusal: refusalOf(state),
	saving: false,
	onQuestion: noop,
	onInlineCode: noop,
	onCodeBlock: noop,
	onView: noop,
	revealed: false,
	onPreviewPick: noop,
	onAnswerType: noop,
	onAnswerChange: noop,
	onMarkRight: noop,
	onAddAnswer: canAddAnswer(state) ? noop : undefined,
	onRemoveAnswer: canRemoveAnswer(state) ? noop : undefined,
	onCategory: noop,
	onStatus: noop,
	onSandbox: noop,
	onExplanation: noop,
	onSubmit: refusalOf(state) === undefined ? noop : undefined,
	...overrides,
});

const meta: Meta<typeof PollForm> = {
	component: PollForm,
	title: "Polls/PollForm",
	args: propsFor(EMPTY_POLL_FORM),
};
export default meta;

type Story = StoryObj<typeof PollForm>;

export const Empty: Story = {};

export const Filled: Story = { args: propsFor(FILLED) };

export const Preview: Story = {
	args: propsFor(FILLED, { view: "preview" satisfies PollFormView }),
};

export const PreviewRevealed: Story = {
	args: propsFor(
		{ ...FILLED, codeSandboxExample: "https://codesandbox.io/s/float" },
		{
			view: "preview" satisfies PollFormView,
			revealed: true,
			preview: previewOf(FILLED, pickInPreview(UNPLAYED, FILLED, "0")),
		}
	),
};

export const SeveralRight: Story = { args: propsFor(SEVERAL) };

export const Editing: Story = {
	args: propsFor(FILLED, {
		mode: "edit",
		pollNumber: 9,
		statuses: STATUS_CHOICES,
		reward: undefined,
	}),
};

export const Refused: Story = {
	args: propsFor({
		...FILLED,
		answers: FILLED.answers.map((answer) => ({ ...answer, right: false })),
	}),
};

export const Saving: Story = { args: propsFor(FILLED, { saving: true }) };

export const Failed: Story = {
	args: propsFor(FILLED, { error: "The database is asleep. Try again." }),
};
