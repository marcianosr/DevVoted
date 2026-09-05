import type { Meta, StoryObj } from "@storybook/react";

import { BuildList, type BuildListRow } from "./BuildList.ui";
import { Legend } from "./Legend.ui";
import { Section } from "./Section.ui";

const noop = () => {};

const meta: Meta<typeof BuildList> = {
	component: BuildList,
	title: "Terminal/BuildList",
	decorators: [
		(Story) => (
			<div className="@container w-72 rounded-xl bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof BuildList>;

const tenConfigRows: readonly BuildListRow[] = [
	{
		name: "ESLint",
		slots: 1,
		version: 1,
		detail: "Cross out a wrong answer",
		dot: "action",
		use: { label: "use", price: "16 KB", onUse: noop },
	},
	{
		name: "Telemetry",
		slots: 2,
		version: 1,
		detail: "See the community split",
		dot: "action",
		use: { label: "use", price: "8 KB", onUse: noop },
	},
	{
		name: ".js",
		slots: 1,
		version: 1,
		detail: "JS polls ×1.25",
		dot: "on",
		figure: "×1.25",
	},
	{
		name: ".jsx",
		slots: 1,
		version: 1,
		detail: "React polls ×1.25",
		dot: "on",
		figure: "×1.25",
	},
	{
		name: "Deprecated",
		slots: 4,
		version: 1,
		detail: "All coverage ×2.5 · gone in 3 clears",
		dot: "on",
		figure: "×2.5",
		meterPercent: 66,
	},
	{
		name: "Overclock",
		slots: 4,
		version: 1,
		detail: "First answer ×4, every later one ×0.5",
		dot: "on",
		figure: "×0.5",
	},
	{
		name: "IndexedDB",
		slots: 2,
		version: 1,
		detail: "+8 KB an answer · 288 of 320",
		dot: "on",
		figure: "+8 KB",
		meterPercent: 90,
	},
	{
		name: "Moore's Law",
		slots: 1,
		version: 1,
		detail: "+2% of held storage a clear",
		dot: "on",
		figure: "on clear",
	},
	{ name: ".ts", slots: 1, version: 1, detail: "TS polls only", dot: "off" },
	{
		name: "Cold Start",
		slots: 2,
		version: 1,
		detail: "The gate's first answer ×2",
		dot: "off",
	},
];

const total = { label: "Total", value: "×3.1" };

export const InTheSection: Story = {
	render: () => (
		<Section label="Build" meta="10">
			<Legend variants={tenConfigRows.map((row) => row.dot)} className="pb-2" />
			<BuildList rows={tenConfigRows} total={total} />
		</Section>
	),
};

export const AConfigInFocus: Story = {
	render: () => (
		<Section label="Build" meta="10">
			<Legend variants={tenConfigRows.map((row) => row.dot)} className="pb-2" />
			<BuildList
				rows={tenConfigRows.map((row) =>
					row.name === "Overclock" ? { ...row, focused: true } : row
				)}
				total={total}
			/>
		</Section>
	),
};

export const AnAuditStoppedOne: Story = {
	render: () => (
		<Section label="Build" meta="10">
			<Legend
				variants={tenConfigRows.map((row) =>
					row.name === "Telemetry" ? "blocked" : row.dot
				)}
				className="pb-2"
			/>
			<BuildList
				rows={tenConfigRows.map((row) =>
					row.name === "Telemetry"
						? {
								...row,
								dot: "blocked" as const,
								figure: "402 stopped it",
							}
						: row
				)}
				total={total}
			/>
		</Section>
	),
};

export const NothingUsable: Story = {
	render: () => (
		<Section label="Build" meta="4">
			<BuildList
				rows={tenConfigRows.filter((row) => row.dot === "on").slice(0, 4)}
				total={{ label: "Total", value: "×1.9" }}
			/>
		</Section>
	),
};
