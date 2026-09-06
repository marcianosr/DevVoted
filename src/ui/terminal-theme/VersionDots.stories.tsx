import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text.ui";
import { VersionDots } from "./VersionDots.ui";

const meta: Meta<typeof VersionDots> = {
	component: VersionDots,
	title: "Terminal/VersionDots",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof VersionDots>;

export const Fresh: Story = { args: { version: 1, maxVersion: 5 } };

export const Maxed: Story = { args: { version: 5, maxVersion: 5 } };

/** Telemetry and Dependabot stop at v2, so the track has to read as finished at
 * two pips as clearly as it does at five. */
export const ShortCeiling: Story = { args: { version: 2, maxVersion: 2 } };

export const EveryRung: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{[0, 1, 2, 3, 4, 5].map((version) => (
				<span key={version} className="flex items-center gap-3">
					<VersionDots version={version} maxVersion={5} />
					<Text tone="muted" size="caption">
						{version === 0 ? "never dealt" : `v${version}`}
					</Text>
				</span>
			))}
		</div>
	),
};
