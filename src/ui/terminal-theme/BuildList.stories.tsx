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
			<div className="@container w-60 rounded-xl bg-zinc-900 p-4">
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
		detail: "Cross out a wrong answer",
		dot: "action",
		use: { label: "use", price: "16 KB", onUse: noop },
	},
	{
		name: "Telemetry",
		detail: "See the community split",
		dot: "action",
		use: { label: "use", price: "8 KB", onUse: noop },
	},
	{ name: ".js", detail: "JS polls ×1.25", dot: "on", figure: "×1.25" },
	{ name: ".jsx", detail: "React polls ×1.25", dot: "on", figure: "×1.25" },
	{
		name: "Deprecated",
		detail: "All coverage ×2.5 · gone in 3 clears",
		dot: "on",
		figure: "×2.5",
		meterPercent: 66,
	},
	{
		name: "Overclock",
		detail: "First answer ×4, every later one ×0.5",
		dot: "on",
		figure: "×0.5",
	},
	{
		name: "IndexedDB",
		detail: "+8 KB an answer · 288 of 320",
		dot: "on",
		figure: "+8 KB",
		meterPercent: 90,
	},
	{
		name: "Moore's Law",
		detail: "+2% of held storage a clear",
		dot: "on",
		figure: "on clear",
	},
	{ name: ".ts", detail: "TS polls only", dot: "off" },
	{ name: "Cold Start", detail: "The gate's first answer ×2", dot: "off" },
];

const total = { label: "this answer", value: "×3.1" };

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
								name: row.name,
								detail: row.detail,
								dot: "blocked",
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
				total={{ label: "this answer", value: "×1.9" }}
			/>
		</Section>
	),
};
