import type { Meta, StoryObj } from "@storybook/react";

import { Audits } from "./Audits.ui";

const meta: Meta<typeof Audits> = {
	component: Audits,
	title: "Terminal/Audits",
	decorators: [
		(Story) => (
			<div className="@container max-w-3xl bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

export const Suppressed: StoryObj<typeof Audits> = {
	args: {
		rows: [
			{
				code: "408",
				name: "Request Timeout",
				cue: "on the clock",
				suppressed: true,
			},
			{
				code: "402",
				name: "Payment Required",
				cue: "paid actions cost double",
			},
		],
	},
};
type Story = StoryObj<typeof Audits>;

export const SuppressedNamesItsConfig: Story = {
	args: {
		rows: [
			{
				code: "402",
				name: "Payment Required",
				cue: "paid actions cost double",
				suppressed: true,
				suppressedBy: { label: "Volkswagen CI", slots: 8, version: 1 },
			},
		],
	},
};

export const OneAudit: Story = {
	args: {
		rows: [
			{
				code: "402",
				name: "Payment Required",
				cue: "paid actions cost double",
			},
		],
	},
};

export const ThreeAtOnce: Story = {
	args: {
		rows: [
			{ code: "424", name: "Failed Dependency", cue: "Deprecated is offline" },
			{
				code: "402",
				name: "Payment Required",
				cue: "paid actions cost double",
			},
			{
				code: "429",
				name: "Too Many Requests",
				cue: "one use per gate, not three",
			},
		],
	},
};

export const InANarrowColumn: Story = {
	...ThreeAtOnce,
	decorators: [
		(Story) => (
			<div className="@container w-[380px] bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
