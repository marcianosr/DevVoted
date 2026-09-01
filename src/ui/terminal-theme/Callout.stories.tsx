import type { Meta, StoryObj } from "@storybook/react";

import { Callout } from "./Callout.ui";
import { GitTagIcon } from "./GitTagIcon.ui";
import { Panel } from "./Panel.ui";

const meta: Meta<typeof Callout> = {
	component: Callout,
	title: "Terminal/Callout",
};
export default meta;
type Story = StoryObj<typeof Callout>;

export const RestoredFromAGitTag: Story = {
	render: () => (
		<Panel theme="seafoam">
			<Callout
				mark={<GitTagIcon />}
				title="Restored from your git tag"
				detail="You start at gate 12 with the build you saved, instead of gate 0 with four slots. The tag is spent — save another in a shop to keep this run."
			/>
		</Panel>
	),
};

export const WearsTheGateYouAreOn: Story = {
	render: () => (
		<Panel theme="lavender">
			<Callout
				mark={<GitTagIcon />}
				title="Restored from your git tag"
				detail="You start at gate 4 with the build you saved. The tag is spent — save another in a shop to keep this run."
			/>
		</Panel>
	),
};
