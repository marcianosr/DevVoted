import type { Meta, StoryObj } from "@storybook/react";

import { Ledger, type LedgerEntry } from "./Ledger.ui";
import { Mark } from "./Mark.ui";
import { Swatch } from "./Swatch.ui";

// Game-design reason: a player who cannot tell whether a config is earning its
// slot gets the answer here, per config, in the currency they spend.
const meta: Meta<typeof Ledger> = {
	component: Ledger,
	title: "Modern/Ledger",
	decorators: [
		(Story) => (
			<div data-gate-theme="pallet" className="max-w-md p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Ledger>;

const COVERAGE: readonly LedgerEntry[] = [
	{
		id: "javascript",
		name: "javascript",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["2 polls", ".js ×1.25"],
		value: 2.3,
	},
	{
		id: "git",
		name: "git",
		lead: <Mark variant="pass" shape="box" />,
		notes: ["1 poll"],
		value: 1.2,
	},
	{
		id: "typescript",
		name: "typescript",
		lead: <Mark variant="warn" shape="box" />,
		notes: ["1 poll", "partly right"],
		value: 1,
	},
	{
		id: "css",
		name: "css",
		lead: <Mark variant="fail" shape="box" />,
		notes: ["missed", "streak reset"],
		value: -0.3,
	},
	{
		id: "vue",
		name: "vue",
		lead: <Mark variant="blank" shape="box" />,
		notes: ["no polls"],
		value: 0,
	},
];

const STORAGE: readonly LedgerEntry[] = [
	{
		id: "gate",
		name: "gate clear",
		lead: <Swatch size="pip" />,
		notes: ["4 of 5", "32 × g1"],
		value: 26,
	},
	{
		id: "IndexedDB",
		name: "IndexedDB",
		lead: <Mark variant="pass" />,
		notes: ["4 correct"],
		value: 32,
	},
	{
		id: "UnitTests",
		name: "Unit Tests",
		lead: <Mark variant="pass" />,
		notes: ["on clear"],
		value: 32,
	},
];

export const Coverage: Story = {
	args: { title: "coverage", unit: "%", entries: COVERAGE, showDetail: true },
};

export const Storage: Story = {
	args: { title: "storage", unit: "KB", entries: STORAGE, showDetail: true },
};

/** Folded shut: the total is the answer, so it stays. The attribution is for the
 * player who wants to know which config earned it, and only then. */
export const Folded: Story = {
	args: { title: "storage", unit: "KB", entries: STORAGE, showDetail: false },
};

/** A gate that took more than it paid: the total is the one line that can go
 * negative, and it says so in the same red the losing rows wear. */
export const NetLoss: Story = {
	args: {
		title: "storage",
		unit: "KB",
		showDetail: true,
		entries: [
			{ id: "gate", name: "gate clear", notes: ["1 of 5"], value: 6 },
			{ id: "plan", name: "storage plan", notes: ["billed"], value: -64 },
		],
	},
};
