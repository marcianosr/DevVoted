import type { Meta, StoryObj } from "@storybook/react";

import { Redacted } from "./Redacted.ui";

const meta: Meta<typeof Redacted> = {
	component: Redacted,
	title: "Terminal/Redacted",
	decorators: [
		(Story) => (
			<div className="bg-zinc-950 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Redacted>;

export const Unknown: Story = {};

/** The Audits tab keeps the status class, so three unreached 4xx rules still
 * read as client faults. */
export const KeepsItsShape: Story = { args: { label: "4??" } };

export const ARowOfThem: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			{["5??", "5??", "5??", "5??", "5??"].map((label, index) => (
				<Redacted key={index} label={label} />
			))}
		</div>
	),
};
