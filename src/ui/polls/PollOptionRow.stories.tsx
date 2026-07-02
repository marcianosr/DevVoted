import type { Meta, StoryObj } from "@storybook/react";

import { PollOptionRow } from "./PollOptionRow.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollOptionRow> = {
	component: PollOptionRow,
	title: "Polls/PollOptionRow",
	decorators: [
		withCategoryTheme("js"),
		(Story) => (
			<ul className="space-y-2">
				<Story />
			</ul>
		),
	],
	args: {
		id: "1",
		inputType: "radio",
		text: "`Array.prototype.at(-1)`",
		checked: false,
		onToggle: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof PollOptionRow>;

export const Unchecked: Story = {};

export const Checked: Story = {
	args: { checked: true },
};

export const Disabled: Story = {
	args: { disabled: true, text: "`Array.prototype.pop()`" },
};

export const RemovedByConfig: Story = {
	args: {
		disabled: true,
		removedByConfig: {
			name: "ESLint",
			rarity: "uncommon",
			description:
				"Disables 1 wrong option when answering JavaScript/TypeScript polls.",
		},
		text: "`Array.prototype.pop()`",
	},
};

export const WithPeerMarker: Story = {
	args: { markerEmoji: "👤", markerTitle: "Tooie picked this" },
};
