import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Pick } from "./Pick.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex items-center gap-3";

const meta: Meta<typeof Pick> = {
	component: Pick,
	title: "Kanto/Pick",
	parameters: { controls: { disable: true } },
	args: { label: "Drop ESLint", checked: false, onToggle: () => {} },
	render: (args) => (
		<Screen gate="lavender" width="narrow">
			<span className={ROW}>
				<Pick {...args} />
				<Typography variant="caption" as="span">
					{args.label}
				</Typography>
			</span>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Pick>;

export const Resting: Story = {};

export const Picked: Story = { args: { checked: true } };

export const Spent: Story = { args: { disabled: true } };

const Toggling = () => {
	const [checked, setChecked] = useState(false);

	return (
		<Screen gate="lavender" width="narrow">
			<span className={ROW}>
				<Pick
					label="Drop ESLint"
					checked={checked}
					onToggle={() => setChecked((picked) => !picked)}
				/>
				<Typography variant="caption" as="span">
					{checked ? "dropping ESLint" : "keeping ESLint"}
				</Typography>
			</span>
		</Screen>
	);
};

export const Picking: Story = { render: () => <Toggling /> };
