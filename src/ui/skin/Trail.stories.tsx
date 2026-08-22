import type { Meta, StoryObj } from "@storybook/react";

import { Trail, type TrailItem } from "./Trail.ui";

// Game-design reason: the trail is the only place a player sees how the gate is
// going while they are still in it — verdicts behind, the poll they are on, and
// how many are left, without leaving the question.
const items: readonly TrailItem[] = [
	{ id: "gate", label: "gate 4", state: "answered", verdict: "pass" },
	{
		id: "poll-1",
		label: "poll 1",
		suffix: "css",
		state: "answered",
		verdict: "pass",
	},
	{
		id: "poll-2",
		label: "poll 2",
		suffix: "git",
		state: "answered",
		verdict: "pass",
	},
	{ id: "poll-3", label: "poll 3", suffix: "ts", state: "current" },
	{ id: "poll-4", label: "poll 4", state: "disabled" },
	{ id: "poll-5", label: "poll 5", state: "disabled" },
];

const mixed: readonly TrailItem[] = [
	{ id: "gate", label: "gate 4", state: "answered", verdict: "pass" },
	{
		id: "poll-1",
		label: "poll 1",
		suffix: "css",
		state: "answered",
		verdict: "part",
	},
	{
		id: "poll-2",
		label: "poll 2",
		suffix: "git",
		state: "answered",
		verdict: "fail",
	},
	{ id: "poll-3", label: "poll 3", suffix: "ts", state: "current" },
	{ id: "poll-4", label: "poll 4", state: "disabled" },
];

const meta: Meta<typeof Trail> = {
	component: Trail,
	title: "Skin/Trail",
	args: { label: "Gate 4 progress" },
	decorators: [
		(Story) => (
			<div data-gate-theme="elite" className="w-[52rem]">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Trail>;

/** Three cleared, one live, two out of reach. */
export const InProgress: Story = { args: { items } };

/** Every verdict a dot can report: pass, part, fail. */
export const EveryVerdict: Story = { args: { items: mixed } };

/** Answered crumbs are clickable; the disabled ones refuse and say so. */
export const Clickable: Story = {
	args: {
		items: items.map((item) => ({ ...item, onSelect: () => {} })),
	},
};
