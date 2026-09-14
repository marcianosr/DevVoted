import type { Meta, StoryObj } from "@storybook/react";

import { LedgerRows } from "./LedgerRows.ui";
import { Screen } from "./Screen.ui";

const ANSWERS = [
	{
		verdict: "correct" as const,
		tags: [{ label: "React" }],
		detail: "Which of these are React hooks?",
		figures: [{ label: "+8.0", color: "viridian" as const }],
	},
	{
		verdict: "partial" as const,
		share: 0.75,
		tags: [{ label: "TypeScript" }],
		detail: "Which are TS utility types?",
		figures: [{ label: "+6.0", color: "viridian" as const }],
	},
	{
		verdict: "partial" as const,
		share: 0.25,
		tags: [{ label: "CSS" }],
		detail: "Which selectors match a direct child?",
		figures: [{ label: "+2.0", color: "viridian" as const }],
	},
	{
		verdict: "wrong" as const,
		tags: [{ label: "Git" }],
		detail: "Which flag rewrites history?",
		figures: [{ label: "0.0", tone: "quiet" as const }],
	},
	{
		verdict: "correct" as const,
		tags: [{ label: "JavaScript" }],
		detail: "What does Array.prototype.at(-1) return?",
		figures: [{ label: "+8.0", color: "viridian" as const }],
	},
];

const PAYOUTS = [
	{
		label: "gate cleared",
		tags: [{ label: "x6" }],
		figures: [{ label: "+192 KB", color: "viridian" as const }],
	},
	{
		label: "IndexedDB",
		detail: "+8 KB per correct answer",
		figures: [{ label: "+24 KB", color: "viridian" as const }],
	},
	{
		label: "this gate",
		total: true,
		figures: [{ label: "+216 KB", color: "viridian" as const }],
	},
];

const meta: Meta<typeof LedgerRows> = {
	component: LedgerRows,
	title: "Kanto/LedgerRows",
	args: { rows: ANSWERS },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<LedgerRows {...args} />
		</Screen>
	),
};

export default meta;

type Story = StoryObj<typeof LedgerRows>;

export const Answers: Story = {};

export const Payouts: Story = { args: { rows: PAYOUTS } };

export const Tabled: Story = { args: { rows: ANSWERS, tabled: true } };

export const WithMeter: Story = {
	args: {
		rows: ANSWERS,
		meter: { value: 39.4, max: 50 },
	},
};
