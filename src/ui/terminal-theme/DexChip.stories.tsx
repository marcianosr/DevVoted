import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { DexChip } from "./DexChip.ui";

const meta: Meta<typeof DexChip> = {
	component: DexChip,
	title: "Terminal/DexChip",
	decorators: [
		(Story) => (
			<div className="bg-zinc-950 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof DexChip>;

export const Seen: Story = {
	args: { slots: 1, label: ".js", version: 5, maxVersion: 5 },
};

export const PartWayUp: Story = {
	args: { slots: 4, label: "Overclock", version: 4, maxVersion: 5 },
};

/** No name and no version, only the size: enough to say a four-slot config is
 * missing from the shelf, never which one. */
export const Unseen: Story = { args: { slots: 4, seen: false } };

export const Selected: Story = {
	args: {
		slots: 4,
		label: "Intellisense",
		version: 1,
		maxVersion: 5,
		selected: true,
		onSelect: () => {},
	},
};

/** The three biggest sizes, escalating: 8 takes the drifting ring and a
 * prismatic mark, 12 adds the wash, 16 runs both at half the period. Keyed to
 * slots, so no caller can put the ring on a one-slot config. */
export const BiggestLadder: Story = {
	render: () => (
		<div className="flex flex-col items-start gap-3">
			<DexChip slots={4} label="Prefetch" version={1} />
			<DexChip slots={8} label="AGENTS.md" version={1} />
			<DexChip slots={12} label="Twelve slots" version={1} />
			<DexChip slots={16} label="Sixteen slots" version={1} />
		</div>
	),
};

const ROSTER = [
	{ id: "js", slots: 1, label: ".js", version: 5, maxVersion: 5 },
	{
		id: "indexed-db",
		slots: 2,
		label: "IndexedDB",
		version: 2,
		maxVersion: 4,
	},
	{
		id: "overclock",
		slots: 4,
		label: "Overclock",
		version: 2,
		maxVersion: 5,
	},
	{
		id: "agents-md",
		slots: 8,
		label: "AGENTS.md",
		version: 1,
		maxVersion: 3,
	},
] as const;

const Shelf = () => {
	const [picked, setPicked] = useState("overclock");

	return (
		<div className="flex flex-wrap gap-2">
			{ROSTER.map((config) => (
				<DexChip
					key={config.id}
					slots={config.slots}
					label={config.label}
					version={config.version}
					maxVersion={config.maxVersion}
					selected={config.id === picked}
					onSelect={() => setPicked(config.id)}
				/>
			))}
			<DexChip slots={2} seen={false} />
		</div>
	);
};

/** One chip per rung in play, which is the only way to check the legend's
 * colours read apart from each other. */
export const PickingOne: Story = { render: () => <Shelf /> };
