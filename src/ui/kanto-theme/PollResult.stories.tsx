import type { Meta, StoryObj } from "@storybook/react";

import { PollResult, type PollResultProps } from "./PollResult.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof PollResult> = {
	component: PollResult,
	title: "Kanto/PollResult",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PollResult>;

const frame = (poll: PollResultProps) => (
	<div className="[--screen-floor:14rem]">
		<Screen theme="lavender">
			<PollResult {...poll} />
		</Screen>
	</div>
);

const REVEALED: PollResultProps = {
	state: "revealed",
	index: 1,
	question: "Which property centres a flex child along the main axis?",
	category: "CSS",
	outcome: "wrong",
	rightShare: 22,
	open: true,
	options: [
		{
			letter: "A",
			label: "justify-content",
			percent: 22,
			votes: 265,
			isRight: true,
			voters: [
				{ name: "Sabrina", borderUrl: "/borders/border-react-celadon.svg" },
				{ name: "Koga", borderUrl: "/borders/border-js-saffron.svg" },
			],
		},
		{
			letter: "B",
			label: "align-items",
			percent: 58,
			votes: 698,
			isRight: false,
			yours: true,
			voters: [
				{ name: "Marciano", you: true },
				{ name: "Lt. Surge", borderUrl: "/borders/border-css-cerulean.svg" },
			],
			voterOverflow: 696,
		},
		{
			letter: "C",
			label: "place-self",
			percent: 12,
			votes: 144,
			isRight: false,
			voters: [{ name: "Brock", borderUrl: "/borders/border-git-pewter.svg" }],
			voterOverflow: 143,
		},
		{
			letter: "D",
			label: "text-align",
			percent: 8,
			votes: 96,
			isRight: false,
			voters: [{ name: "Erika" }],
			voterOverflow: 95,
		},
	],
};

export const Revealed: Story = { render: () => frame(REVEALED) };

export const Shut: Story = {
	render: () => frame({ ...REVEALED, open: false }),
};

export const TheRoomGotIt: Story = {
	render: () =>
		frame({
			...REVEALED,
			question: "Which utility type makes every property optional?",
			category: "TypeScript",
			outcome: "correct",
			rightShare: 81,
			open: false,
		}),
};

export const Split: Story = {
	render: () =>
		frame({
			...REVEALED,
			question: "What does a rebase rewrite?",
			category: "Git",
			outcome: "correct",
			rightShare: 48,
			open: false,
		}),
};

export const Sealed: Story = {
	render: () =>
		frame({
			state: "sealed",
			index: 2,
			question: "What does Promise.all reject with?",
		}),
};
