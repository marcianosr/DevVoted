import type { Meta, StoryObj } from "@storybook/react";

import type { BuildRow } from "./Build.ui";
import { BuildTrack } from "./BuildTrack.ui";

const meta: Meta<typeof BuildTrack> = {
	component: BuildTrack,
	title: "Modern/BuildTrack",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-3xl p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof BuildTrack>;

const BUILD: readonly BuildRow[] = [
	{
		id: "js",
		label: ".js",
		slots: 1,
		status: {
			kind: "skipped",
			why: { kind: "otherCategories", categories: ["js"] },
		},
		figure: { kind: "multiplier", value: 1.25 },
	},
	{
		id: "ts",
		label: ".ts",
		slots: 1,
		status: { kind: "online" },
		figure: { kind: "multiplier", value: 1.25 },
	},
	{
		id: "code-coverage",
		label: "Code Coverage",
		slots: 2,
		status: { kind: "online" },
		figure: { kind: "coverage", value: 0.5 },
	},
	{
		id: "agents-md",
		label: "AGENTS.md",
		slots: 1,
		status: { kind: "offline", audit: "Dependency Outage" },
	},
];

export const OnAPoll: Story = {
	args: { configs: BUILD, slots: 7, maxSlots: 24 },
};

export const WholeBuildStanding: Story = {
	args: {
		configs: BUILD.filter((row) => row.status.kind !== "offline"),
		slots: 7,
		maxSlots: 24,
	},
};

export const NoRoomLeft: Story = {
	args: { configs: BUILD, slots: 5, maxSlots: 5 },
};

export const WithPaidActions: Story = {
	args: {
		slots: 6,
		maxSlots: 24,
		configs: [
			{
				id: "eslint",
				label: "ESLint",
				slots: 1,
				status: { kind: "online" },
				action: {
					label: "cross out",
					on: "ESLint",
					cost: "8 KB",
					onUse: () => undefined,
				},
			},
			{
				id: "telemetry",
				label: "Telemetry",
				slots: 2,
				status: { kind: "online" },
				action: {
					label: "peek",
					on: "Telemetry",
					cost: "32 KB",
					disabled: true,
					hint: "Costs 32KB — you have 12KB",
					onUse: () => undefined,
				},
			},
		],
	},
};

export const Settled: Story = {
	args: {
		settled: true,
		slots: 7,
		maxSlots: 24,
		configs: BUILD.map((row) =>
			row.id === "ts"
				? { ...row, fired: 0.7 }
				: row.id === "code-coverage"
					? { ...row, fired: 0.5 }
					: row
		),
	},
};

/**
 * Narrow screens fold the track away and stack it. Storybook renders it wide, so
 * the fold shows as a caret that does nothing until the viewport drops below lg.
 */
export const Foldable: Story = {
	args: {
		configs: BUILD,
		slots: 7,
		maxSlots: 24,
		open: false,
		onToggle: () => undefined,
	},
};

export const AByteFillsIt: Story = {
	args: {
		slots: 8,
		maxSlots: 8,
		configs: [
			{
				id: "freemium",
				label: "Freemium",
				slots: 8,
				status: { kind: "skipped", why: { kind: "billsAtGateClear" } },
			},
		],
	},
};
