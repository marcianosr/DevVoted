import type { Meta, StoryObj } from "@storybook/react";

import { Letter } from "./Letter.ui";
import { optionLetter } from "./format";

const meta: Meta<typeof Letter> = {
	component: Letter,
	title: "Modern/Letter",
	args: { letter: "A" },
};
export default meta;

type Story = StoryObj<typeof Letter>;

export const Untouched: Story = {};

export const Expected: Story = { args: { tone: "celadon" } };

export const WrongPick: Story = { args: { letter: "B", tone: "cinnabar" } };

export const EveryOption: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			{Array.from({ length: 4 }, (_, index) => (
				<Letter key={index} letter={optionLetter(index)} />
			))}
		</div>
	),
};
