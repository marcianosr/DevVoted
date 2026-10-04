import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { SearchField } from "./SearchField.ui";

const noop = () => {};

const meta: Meta<typeof SearchField> = {
	component: SearchField,
	title: "Kanto/SearchField",
	args: {
		label: "Search questions",
		value: "",
		placeholder: "search questions…",
		onChange: noop,
	},
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<SearchField {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SearchField>;

export const Empty: Story = {};

export const Typed: Story = { args: { value: "flex" } };
