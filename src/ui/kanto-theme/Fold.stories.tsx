import type { Meta, StoryObj } from "@storybook/react";

import { Fold } from "./Fold.ui";
import { LedgerRows } from "./LedgerRows.ui";
import { Screen } from "./Screen.ui";

const COVERAGE = [
	{
		label: "JavaScript",
		tags: [{ label: "2 polls" }],
		figures: [{ label: "+24.6", color: "viridian" as const }],
	},
	{
		label: "Git",
		tags: [{ label: "1 poll" }],
		figures: [{ label: "+19.2", color: "viridian" as const }],
	},
	{
		label: "CSS",
		tags: [{ label: "1 poll" }],
		figures: [{ label: "−4.4", color: "cinnabar" as const }],
	},
	{
		label: "this gate",
		total: true,
		figures: [
			{ label: "+39.4%", color: "viridian" as const },
			{ label: "of 25% needed", tone: "quiet" as const },
		],
	},
];

const meta: Meta<typeof Fold> = {
	component: Fold,
	title: "Kanto/Fold",
	args: {
		title: "Coverage by category",
		summary: "3 categories",
		badges: [{ label: "+39.4%", color: "viridian" }],
		open: false,
	},
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Fold {...args}>
				<LedgerRows rows={COVERAGE} />
			</Fold>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Fold>;

export const Shut: Story = {};

export const Open: Story = { args: { open: true } };

export const TwoBadges: Story = {
	args: {
		title: "Build changes",
		summary: undefined,
		badges: [
			{ label: "1 unlocked", color: "viridian" },
			{ label: "1 faded", color: "saffron" },
		],
	},
};

export const BareStrip: Story = {
	args: { title: "Audits", summary: undefined, badges: [] },
};
