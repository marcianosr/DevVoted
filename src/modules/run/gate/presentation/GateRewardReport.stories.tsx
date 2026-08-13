import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { GateRewardRow } from "~/modules/run/gate/domain/gateReward.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { VICTORY_GATE } from "~/modules/run/run/domain/rules.model";
import { GateRewardReport } from "~/modules/run/gate/presentation/GateRewardReport.ui";

const clearedRows: GateRewardRow[] = [
	{
		key: "css",
		config: CONFIGS.css,
		reason: { kind: "config" },
		value: { unit: "percent", amount: 0.3 },
		kind: "coverage",
		status: "passed",
	},
	{
		key: "agents-md",
		config: CONFIGS.agentsMd,
		reason: { kind: "config" },
		value: { unit: "percent", amount: 3.9 },
		kind: "coverage",
		status: "passed",
	},
	{
		key: "indexed-db",
		config: CONFIGS.indexedDb,
		reason: { kind: "config" },
		value: { unit: "kb", amount: 32 },
		kind: "storage",
		status: "passed",
	},
	{
		key: "unit-tests",
		config: CONFIGS.unitTests,
		reason: { kind: "config" },
		value: { unit: "kb", amount: 32 },
		kind: "storage",
		status: "passed",
	},
	{
		key: "eslint",
		config: CONFIGS.eslint,
		reason: { kind: "config" },
		value: { unit: "checkProgress", text: "not linted" },
		kind: "check",
		status: "skipped",
	},
];

const failedRows: GateRewardRow[] = [
	{
		key: "css",
		config: CONFIGS.css,
		reason: { kind: "noPollInCategory", category: "css" },
		value: { unit: "none" },
		kind: "coverage",
		status: "skipped",
	},
	{
		key: "agents-md",
		config: CONFIGS.agentsMd,
		reason: { kind: "config" },
		value: { unit: "percent", amount: 2.4 },
		kind: "coverage",
		status: "passed",
	},
	{
		key: "indexed-db",
		config: CONFIGS.indexedDb,
		reason: { kind: "config" },
		value: { unit: "kb", amount: 24 },
		kind: "storage",
		status: "passed",
	},
	{
		key: "ts",
		config: CONFIGS.ts,
		reason: { kind: "focusMissed", category: "ts", needed: 1, got: 0 },
		value: { unit: "percent", amount: -1.2 },
		kind: "coverage",
		status: "failed",
	},
	{
		key: "unit-tests",
		config: CONFIGS.unitTests,
		reason: { kind: "config" },
		value: { unit: "checkProgress", text: "1/2" },
		kind: "storage",
		status: "failed",
	},
	{
		key: "eslint",
		config: CONFIGS.eslint,
		reason: { kind: "config" },
		value: { unit: "checkProgress", text: "0/1" },
		kind: "check",
		status: "failed",
	},
];

const meta: Meta<typeof GateRewardReport> = {
	component: GateRewardReport,
	title: "Run/GateRewardReport",
	decorators: [
		(Story) => (
			<div className="max-w-6xl p-4">
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
		swatch: swatchForGate(3),
		rows: clearedRows,
		totals: { storageKb: 136, coveragePct: 5.8 },
	},
};

// The summit's own badge is the only one drawn in the Kanto gradient.
export const ClearedTheSummit: Story = {
	args: {
		gateNumber: VICTORY_GATE,
		cleared: true,
		swatch: swatchForGate(VICTORY_GATE),
		rows: clearedRows,
		totals: { storageKb: 416, coveragePct: 22.4 },
	},
};
