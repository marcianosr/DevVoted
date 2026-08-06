import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import type { GateRewardRow } from "~/modules/run/gate/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { VICTORY_GATE } from "~/modules/run/rules.model";
import { GateRewardReport } from "./GateRewardReport.ui";

const clearedRows: GateRewardRow[] = [
	{
		key: "css",
		config: CONFIGS.css,
		description: CONFIGS.css.description,
		value: "+0.3%",
		kind: "coverage",
		status: "passed",
	},
	{
		key: "copilot",
		config: CONFIGS.copilot,
		description: CONFIGS.copilot.description,
		value: "+3.9%",
		kind: "coverage",
		status: "passed",
	},
	{
		key: "indexed-db",
		config: CONFIGS.indexedDb,
		description: CONFIGS.indexedDb.description,
		value: "+32KB",
		kind: "storage",
		status: "passed",
	},
	{
		key: "unit-tests",
		config: CONFIGS.unitTests,
		description: CONFIGS.unitTests.description,
		value: "+32KB",
		kind: "storage",
		status: "passed",
	},
	{
		key: "eslint",
		config: CONFIGS.eslint,
		description: CONFIGS.eslint.description,
		value: "not linted",
		kind: "check",
		status: "skipped",
	},
];

const failedRows: GateRewardRow[] = [
	{
		key: "css",
		config: CONFIGS.css,
		description: "no css poll in this gate",
		value: "—",
		kind: "coverage",
		status: "skipped",
	},
	{
		key: "copilot",
		config: CONFIGS.copilot,
		description: CONFIGS.copilot.description,
		value: "+2.4%",
		kind: "coverage",
		status: "passed",
	},
	{
		key: "indexed-db",
		config: CONFIGS.indexedDb,
		description: CONFIGS.indexedDb.description,
		value: "+24KB",
		kind: "storage",
		status: "passed",
	},
	{
		key: "ts",
		config: CONFIGS.ts,
		description: "needs 1 correct ts, got 0",
		value: "-1.2%",
		kind: "coverage",
		status: "failed",
	},
	{
		key: "unit-tests",
		config: CONFIGS.unitTests,
		description: CONFIGS.unitTests.description,
		value: "1/2",
		kind: "storage",
		status: "failed",
	},
	{
		key: "eslint",
		config: CONFIGS.eslint,
		description: CONFIGS.eslint.description,
		value: "0/1",
		kind: "check",
		status: "failed",
	},
];

const meta: Meta<typeof GateRewardReport> = {
	component: GateRewardReport,
	title: "Run/GateRewardReport",
	decorators: [
		(Story) => (
			<div className="max-w-2xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateRewardReport>;

export const Cleared: Story = {
	args: {
		gateNumber: 1,
		cleared: true,
		rows: clearedRows,
		totals: { storageKb: 136, coveragePct: 5.8 },
	},
};

export const Failed: Story = {
	args: { gateNumber: 2, cleared: false, rows: failedRows },
};

// Every clear awards its gate's badge (ADR-019) — here gate 3's Thunder Swatch.
export const ClearedWithBadge: Story = {
	args: {
		gateNumber: 3,
		cleared: true,
		earnedSwatch: swatchForGate(3),
		rows: clearedRows,
		totals: { storageKb: 136, coveragePct: 5.8 },
	},
};

// The summit's own badge is the only one drawn in the Kanto gradient.
export const ClearedTheSummit: Story = {
	args: {
		gateNumber: VICTORY_GATE,
		cleared: true,
		earnedSwatch: swatchForGate(VICTORY_GATE),
		rows: clearedRows,
		totals: { storageKb: 416, coveragePct: 22.4 },
	},
};
