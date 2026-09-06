import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { GateHoldScreen, type RemoveRow } from "./GateHoldScreen.ui";

const noop = () => {};

const meta: Meta<typeof GateHoldScreen> = {
	component: GateHoldScreen,
	title: "Terminal/Screens/GateHold",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof GateHoldScreen>;

const removeRows: readonly Omit<RemoveRow, "checked" | "onToggle">[] = [
	{
		name: ".ts",
		detail: "Sat out all 5 polls · earned nothing",
		version: 1,
		maxVersion: 5,
		slots: 1,
	},
	{
		name: ".js",
		detail: "Paid 3 times · +1.8% total",
		version: 1,
		maxVersion: 5,
		slots: 1,
	},
	{
		name: "Deprecated",
		detail: "Paid every poll · +9.2% total",
		version: 1,
		maxVersion: 5,
		slots: 4,
	},
	{
		name: "ESLint",
		detail: "Used once · cost 16 KB",
		version: 1,
		maxVersion: 5,
		slots: 1,
	},
];

const Shelf = () => {
	const [chosen, setChosen] = useState<readonly string[]>([".ts"]);

	const toggle = (name: string) =>
		setChosen((held) =>
			held.includes(name)
				? held.filter((pick) => pick !== name)
				: [...held, name]
		);

	return (
		<GateHoldScreen
			title="Lavender holds"
			subtitle="not earned · the gate stays shut"
			retryNote="retry runs 5 fresh polls"
			chips={[
				{ label: "short by 21.6%", tone: "cinnabar" },
				{ label: "2 of 5 right" },
				{ label: "streak lost" },
			]}
			audits={[
				{ code: "424", name: "Failed Dependency", cue: "Telemetry sat it out" },
			]}
			storage={[
				{ name: "gate cleared", value: "not paid", muted: true },
				{ name: "2 correct answers", figure: "+16 KB" },
				{ name: "storage plan · 768 KB", figure: "−16 KB" },
				{ name: "balance", value: "102 KB" },
			]}
			remove={{
				meta: `2 slots · ${chosen.length} chosen`,
				rows: removeRows.map((row) => ({
					...row,
					checked: chosen.includes(row.name),
					onToggle: () => toggle(row.name),
				})),
			}}
			reviewLabel="Review answers"
			onReview={noop}
			removeLabel="Remove 1 more slot →"
			onRemove={noop}
		/>
	);
};

export const LavenderHolds: Story = { render: () => <Shelf /> };

export const Mobile: Story = {
	...LavenderHolds,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

const eliteRemoveRows: readonly Omit<RemoveRow, "checked" | "onToggle">[] = [
	{
		name: ".py",
		detail: "Sat out all 5 polls · earned nothing",
		version: 1,
		maxVersion: 5,
		slots: 1,
	},
	{
		name: ".ts",
		detail: "Paid once · +0.8% total",
		version: 1,
		maxVersion: 5,
		slots: 1,
	},
	{
		name: ".js",
		detail: "Paid 4 times · +3.6% total",
		version: 2,
		maxVersion: 5,
		slots: 1,
	},
	{
		name: "Telemetry",
		detail: "Used twice · cost 96 KB",
		version: 1,
		maxVersion: 5,
		slots: 2,
	},
	{
		name: "Deprecated",
		detail: "Paid every poll · +12.4% total",
		version: 1,
		maxVersion: 5,
		slots: 4,
	},
	{
		name: "IndexedDB",
		detail: "+40 KB this gate · 312 of 320",
		version: 1,
		maxVersion: 5,
		slots: 2,
	},
	{
		name: "Overclock",
		detail: "First answer paid ×4 · later ×0.5",
		version: 1,
		maxVersion: 5,
		slots: 4,
	},
];

const EliteShelf = () => {
	const [chosen, setChosen] = useState<readonly string[]>([".py", ".ts"]);

	const toggle = (name: string) =>
		setChosen((held) =>
			held.includes(name)
				? held.filter((pick) => pick !== name)
				: [...held, name]
		);

	return (
		<GateHoldScreen
			title="Elite holds"
			subtitle="not earned · the gate stays shut"
			retryNote="retry runs 5 fresh polls"
			chips={[
				{ label: "short by 3.4%", tone: "cinnabar" },
				{ label: "4 of 5 right" },
				{ label: "streak lost" },
			]}
			audits={[
				{ code: "410", name: "Gone", cue: "a miss peels 5 configs, not 4" },
				{
					code: "507",
					name: "Insufficient Storage",
					cue: "leaked 16 KB a poll, 32 KB on a miss",
				},
			]}
			storage={[
				{ name: "gate cleared", value: "not paid", muted: true },
				{ name: "4 correct answers", figure: "+32 KB" },
				{ name: "507 Insufficient Storage", figure: "−64 KB" },
				{ name: "storage plan · 2.5 MB", figure: "−128 KB" },
				{ name: "balance", value: "1.6 MB" },
			]}
			remove={{
				meta: `3 slots · ${chosen.length} chosen`,
				rows: eliteRemoveRows.map((row) => ({
					...row,
					checked: chosen.includes(row.name),
					onToggle: () => toggle(row.name),
				})),
			}}
			reviewLabel="Review answers"
			onReview={noop}
			removeLabel="Remove 1 more slot →"
			onRemove={noop}
		/>
	);
};

export const EliteHolds: Story = { render: () => <EliteShelf /> };

export const EliteHoldsMobile: Story = {
	...EliteHolds,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
