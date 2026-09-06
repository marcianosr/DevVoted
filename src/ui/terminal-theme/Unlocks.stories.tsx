import type { Meta, StoryObj } from "@storybook/react";

import { Unlocks } from "./Unlocks.ui";

const meta: Meta<typeof Unlocks> = {
	component: Unlocks,
	title: "Terminal/Unlocks",
	decorators: [
		(Story) => (
			<div className="@container max-w-3xl bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

export const OneGrant: StoryObj<typeof Unlocks> = {
	args: {
		rows: [
			{
				label: "Telemetry",
				detail: "Earned: peeked the community split 5 times",
				slots: 2,
				version: 1,
				maxVersion: 5,
			},
		],
	},
};

export const TwoGrants: StoryObj<typeof Unlocks> = {
	args: {
		rows: [
			{
				label: "Telemetry",
				detail: "Earned: peeked the community split 5 times",
				slots: 2,
				version: 3,
				maxVersion: 5,
			},
			{
				label: ".html",
				detail: "Earned: answered 25 polls",
				slots: 1,
				version: 1,
				maxVersion: 5,
			},
		],
	},
};
