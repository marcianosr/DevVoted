import type { Meta, StoryObj } from "@storybook/react";

import { Screen } from "./Screen.ui";
import { Switch } from "./Switch.ui";

const meta: Meta<typeof Switch> = {
	component: Switch,
	title: "Kanto/Switch",
	args: { label: "with code", count: 143, checked: false, onChange: () => {} },
	render: (args) => (
		<Screen theme="cerulean" width="narrow">
			<Switch {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };
