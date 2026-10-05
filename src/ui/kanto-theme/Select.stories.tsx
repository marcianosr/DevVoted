import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { Select } from "./Select.ui";

const noop = () => {};

const meta: Meta<typeof Select> = {
	component: Select,
	title: "Kanto/Select",
	args: {
		label: "Creator",
		value: "all",
		options: [
			{ value: "all", label: "all creators" },
			{ value: "brock", label: "Brock" },
			{ value: "misty", label: "Misty" },
			{ value: "erika", label: "Erika" },
		],
		onChange: noop,
	},
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Select {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Creators: Story = {};

export const Chosen: Story = { args: { value: "misty" } };

export const Captioned: Story = {
	args: { label: "category", note: "optional", caption: "shown" },
};

export const Inline: Story = {
	args: { label: "creator", look: "inline" },
};
