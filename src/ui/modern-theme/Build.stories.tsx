import type { Meta, StoryObj } from "@storybook/react";

import { Build, type BuildRow } from "./Build.ui";

const meta: Meta<typeof Build> = {
	component: Build,
	title: "Modern/Build",
	decorators: [
		(Story) => (
			<div data-gate-theme="volcano" className="max-w-sm p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Build>;

const BUILD: readonly BuildRow[] = [
	{
		id: "ts",
		label: ".ts",
		slots: 1,
		status: { kind: "offline", audit: "424 Failed Dependency" },
		explainer: "TS polls pay 1.25× coverage.",
	},
	{
		id: "intellisense",
		label: "Intellisense",
		slots: 4,
		status: { kind: "online" },
		figure: { kind: "multiplier", value: 1.5 },
		explainer: "All coverage earns ×1.5.",
	},
	{
		id: "agents-md",
		label: "AGENTS.md",
		slots: 4,
		status: { kind: "online" },
		figure: { kind: "multiplier", value: 2 },
		explainer: "All coverage earns ×2.",
	},
	{
		id: "eslint",
		label: "ESLint",
		slots: 1,
		status: {
			kind: "skipped",
			why: { kind: "otherCategories", categories: ["js", "ts"] },
		},
		explainer: "Cross out a wrong answer on JS/TS polls for an escalating fee.",
	},
	{
		id: "indexed-db",
		label: "IndexedDB",
		slots: 2,
		status: { kind: "online" },
		figure: { kind: "kb", value: 8 },
		remainingKb: 312,
		explainer: "+8KB storage per correct answer (up to 320KB a run).",
	},
	{
		id: "freemium",
		label: "Freemium",
		slots: 8,
		status: { kind: "skipped", why: { kind: "billsAtGateClear" } },
		explainer: "Every config drafts at half price; each clear bills double.",
	},
];

export const OnAPoll: Story = { args: { configs: BUILD } };

export const FaucetSpent: Story = {
	args: {
		configs: BUILD.map((row) =>
			row.id === "indexed-db"
				? {
						...row,
						status: { kind: "skipped", why: { kind: "runCapReached" } },
						remainingKb: 0,
					}
				: row
		),
	},
};

export const AllOnline: Story = {
	args: {
		configs: BUILD.filter((row) => row.status.kind === "online"),
	},
};

export const WithAPaidAction: Story = {
	args: {
		configs: [
			{
				id: "eslint",
				label: "ESLint",
				slots: 1,
				status: { kind: "online" },
				explainer: "Cross out a wrong answer on JS/TS polls.",
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
				explainer: "Pay a doubling fee to see how the community answered.",
				action: {
					label: "peek",
					on: "Telemetry",
					cost: "32 KB",
					disabled: true,
					onUse: () => undefined,
				},
			},
		],
	},
};

export const Shut: Story = { args: { configs: BUILD, defaultOpen: false } };

export const Settled: Story = {
	args: {
		settled: true,
		configs: BUILD.map((row) =>
			row.status.kind === "online" && row.figure
				? {
						...row,
						fired:
							row.figure.kind === "multiplier" && row.figure.value === 2
								? 1.3
								: 0.7,
					}
				: row
		),
	},
};

export const SettledWithFaucet: Story = {
	args: {
		settled: true,
		configs: [
			{
				id: "indexed-db",
				label: "IndexedDB",
				slots: 2,
				status: { kind: "online" },
				remainingKb: 288,
				firedKb: 8,
				explainer: "+8KB storage per correct answer.",
			},
			...BUILD,
		],
	},
};
