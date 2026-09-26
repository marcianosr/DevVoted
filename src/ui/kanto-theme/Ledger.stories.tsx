import type { Meta, StoryObj } from "@storybook/react";

import { kantoPrepChampion, kantoPrepSealed } from "~/test/kantoPoll.factory";
import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { Ledger, type LedgerProps } from "./Ledger.ui";
import { Screen } from "./Screen.ui";

const sealed = kantoPrepSealed();
const champion = kantoPrepChampion();

const LAVENDER = gateSwatchAt(4);

const DEMAND: LedgerProps = {
	title: "What it asks",
	rows: [
		{
			label: "coverage to pass",
			figures: [
				{ label: "92.5", tone: "headline" },
				{ label: "of", tone: "quiet" },
				{ label: "375%" },
			],
		},
	],
	meter: { value: 92.5, max: 375 },
};

const BILLED: LedgerProps = {
	title: "Billed on a clear",
	rows: [
		{
			label: "storage plan",
			detail: "2 MB cap",
			figures: [{ label: "−224 KB", color: "cinnabar" }],
		},
		{ label: "Freemium", figures: [{ label: "−128 KB", color: "cinnabar" }] },
		{
			label: "total",
			total: true,
			figures: [{ label: "−352 KB", color: "cinnabar" }],
		},
	],
	note: "250 KB short — what you cannot pay lapses.",
};

const OUTCOMES: LedgerProps = {
	title: "How it ends",
	rows: [
		{
			label: "cleared",
			figures: [
				{ label: "+160 KB", color: "viridian" },
				{
					label: `${LAVENDER.gateName} swatch`,
					swatch: { state: "current", swatch: LAVENDER },
				},
			],
		},
		{
			label: "missed",
			figures: [{ label: "peels 1 or 2 configs", color: "cinnabar" }],
		},
	],
	note: "2 of your 7 occupied slots. Drop configs or minify them — your pick.",
};

const meta: Meta<typeof Ledger> = {
	component: Ledger,
	title: "Kanto/Ledger",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen gate="lavender" width="narrow">
			<Ledger {...args} />
		</Screen>
	),
	args: DEMAND,
};
export default meta;

type Story = StoryObj<typeof Ledger>;

export const Demand: Story = {};

export const Withheld: Story = { args: sealed.polls };

export const Revealed: Story = { args: champion.polls };

export const Billed: Story = { args: BILLED };

export const Outcomes: Story = { args: OUTCOMES };
