import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text.ui";
import { VersionTrack } from "./VersionTrack.ui";

const meta: Meta<typeof VersionTrack> = {
	component: VersionTrack,
	title: "Terminal/VersionTrack",
	decorators: [
		(Story) => (
			<div className="bg-zinc-950 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof VersionTrack>;

export const PartWayUp: Story = { args: { best: 4, maxVersion: 5 } };

export const Maxed: Story = { args: { best: 5, maxVersion: 5 } };

export const NeverUpgraded: Story = { args: { best: 1, maxVersion: 5 } };

export const NeverDealt: Story = { args: { best: 0, maxVersion: 5 } };

/** Telemetry and Dependabot stop at v2, so a short ladder has to read as
 * finished rather than as a long one cut off. */
export const ShortLadder: Story = { args: { best: 2, maxVersion: 2 } };

export const EveryRung: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{[0, 1, 2, 3, 4, 5].map((best) => (
				<span key={best} className="flex items-center gap-3">
					<Text tone="faint" size="caption" className="w-16">
						best {best === 0 ? "—" : `v${best}`}
					</Text>
					<VersionTrack best={best} maxVersion={5} />
				</span>
			))}
		</div>
	),
};
