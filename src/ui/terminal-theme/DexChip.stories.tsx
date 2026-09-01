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
	args: { family: "focus", label: ".js", version: 5, maxVersion: 5 },
};

export const PartWayUp: Story = {
	args: { family: "risk", label: "Overclock", version: 4, maxVersion: 5 },
};

/** No name and no version, only the family: enough to say a four-slot gamble is
 * missing from the shelf, never which one. */
export const Unseen: Story = { args: { family: "risk", seen: false } };

export const Selected: Story = {
	args: {
		family: "amplify",
		label: "Intellisense",
		version: 1,
		maxVersion: 5,
		selected: true,
		onSelect: () => {},
	},
};

const ROSTER = [
	{ id: "js", family: "focus", label: ".js", version: 5, maxVersion: 5 },
	{
		id: "eslint",
		family: "defense",
		label: "ESLint",
		version: 3,
		maxVersion: 5,
	},
	{
		id: "indexed-db",
		family: "economy",
		label: "IndexedDB",
		version: 2,
		maxVersion: 5,
	},
	{
		id: "cold-start",
		family: "amplify",
		label: "Cold Start",
		version: 1,
		maxVersion: 5,
	},
	{
		id: "overclock",
		family: "risk",
		label: "Overclock",
		version: 4,
		maxVersion: 5,
	},
] as const;

const Shelf = () => {
	const [picked, setPicked] = useState("overclock");

	return (
		<div className="flex flex-wrap gap-2">
			{ROSTER.map((config) => (
				<DexChip
					key={config.id}
					family={config.family}
					label={config.label}
					version={config.version}
					maxVersion={config.maxVersion}
					selected={config.id === picked}
					onSelect={() => setPicked(config.id)}
				/>
			))}
			<DexChip family="economy" seen={false} />
		</div>
	);
};

/** All five families side by side, which is the only way to check the legend's
 * colours read apart from each other. */
export const PickingOne: Story = { render: () => <Shelf /> };
