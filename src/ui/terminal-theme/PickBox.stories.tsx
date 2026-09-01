import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { PickBox } from "./PickBox.ui";

const meta: Meta<typeof PickBox> = {
	component: PickBox,
	title: "Terminal/PickBox",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof PickBox>;

export const Unchecked: Story = {
	args: { checked: false, label: "remove .js" },
};

export const Checked: Story = {
	args: { checked: true, label: "remove .ts" },
};

const Toggling = () => {
	const [checked, setChecked] = useState(false);
	return (
		<PickBox
			checked={checked}
			label="remove ESLint"
			onToggle={() => setChecked((held) => !held)}
		/>
	);
};

export const Interactive: Story = { render: () => <Toggling /> };
