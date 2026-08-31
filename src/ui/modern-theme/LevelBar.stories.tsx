import type { Meta, StoryObj } from "@storybook/react";

import { LevelBar } from "./LevelBar.ui";
import { SlotMark } from "./SlotMark.ui";

const meta: Meta<typeof LevelBar> = {
	component: LevelBar,
	title: "Modern/LevelBar",
};
export default meta;

type Story = StoryObj<typeof LevelBar>;

export const Fresh: Story = { args: { level: 1, maxLevel: 5 } };
export const PartWay: Story = { args: { level: 3, maxLevel: 5 } };
export const Maxed: Story = { args: { level: 5, maxLevel: 5 } };

export const ShortLadder: Story = { args: { level: 1, maxLevel: 2 } };

export const EveryStep: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{[1, 2, 3, 4, 5].map((level) => (
				<span key={level} className="flex items-center gap-3">
					<LevelBar level={level} maxLevel={5} />
					<span className="font-mono text-xs text-zinc-400">level {level}</span>
				</span>
			))}
		</div>
	),
};

export const BesideTheGrade: Story = {
	render: () => (
		<ul className="flex w-72 flex-col gap-2">
			<li className="flex items-center gap-2">
				<SlotMark slots={1} />
				<span className="font-mono text-xs text-zinc-200">.js</span>
				<span className="ml-auto">
					<LevelBar level={1} maxLevel={5} />
				</span>
			</li>
			<li className="flex items-center gap-2">
				<SlotMark slots={8} />
				<span className="font-mono text-xs text-zinc-200">AGENTS.md</span>
				<span className="ml-auto">
					<LevelBar level={4} maxLevel={5} />
				</span>
			</li>
		</ul>
	),
};
