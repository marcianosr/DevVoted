import type { Meta, StoryObj } from "@storybook/react";

import {
	PollApprovedModal,
	type PollApprovedModalProps,
} from "~/modules/polls/authoring/presentation/PollApprovedModal.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const flex = {
	id: 74,
	segments: [
		{ kind: "text", text: "What does " },
		{ kind: "code", text: "flex: 1" },
		{ kind: "text", text: " expand to?" },
	],
} satisfies PollApprovedModalProps["questions"][number];

const hoist = {
	id: 76,
	segments: [
		{ kind: "text", text: "Is a " },
		{ kind: "code", text: "const" },
		{ kind: "text", text: " hoisted?" },
	],
} satisfies PollApprovedModalProps["questions"][number];

const meta: Meta<typeof PollApprovedModal> = {
	component: PollApprovedModal,
	title: "Polls/PollApprovedModal",
	render: (args) => (
		<Screen theme="viridian">
			<PollApprovedModal {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof PollApprovedModal>;

export const OnePoll: Story = {
	args: {
		heading: "Your poll is live",
		reward: "+16 KB",
		fromKb: 496,
		toKb: 512,
		questions: [flex],
		onDismiss: noop,
	},
};

export const SeveralPolls: Story = {
	args: {
		heading: "2 of your polls are live",
		reward: "+32 KB",
		fromKb: 480,
		toKb: 512,
		questions: [flex, hoist],
		onDismiss: noop,
	},
};
