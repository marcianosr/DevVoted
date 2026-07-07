import type { Meta, StoryObj } from "@storybook/react";

import { GatePathmap, type GatePathmapSlotDifficulty } from "./GatePathmap.ui";

const meta: Meta<typeof GatePathmap> = {
	component: GatePathmap,
	title: "Polls/GatePathmap",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-8 min-w-[700px]">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GatePathmap>;

const initials = (name: string) => (
	<div
		style={{
			width: 32,
			height: 32,
			borderRadius: "50%",
			background: "#3f3f46",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 11,
			color: "#e4e4e7",
			fontWeight: 600,
			flexShrink: 0,
		}}
	>
		{name.slice(0, 2).toUpperCase()}
	</div>
);

const banjo = {
	id: "banjo",
	displayName: "Banjo",
	currentGate: 2,
	pollsInWindow: 3,
	windowSize: 5,
	slots: ["low", "medium", "high"] as GatePathmapSlotDifficulty[],
	isViewer: true,
	avatarNode: initials("Banjo"),
};

const kazooie = {
	id: "kazooie",
	displayName: "Kazooie",
	currentGate: 3,
	pollsInWindow: 1,
	windowSize: 5,
	slots: ["medium", "high", "critical"] as GatePathmapSlotDifficulty[],
	avatarNode: initials("Kazooie"),
};

const mumbo = {
	id: "mumbo",
	displayName: "Mumbo",
	currentGate: 1,
	pollsInWindow: 4,
	windowSize: 5,
	slots: ["low", "low"] as GatePathmapSlotDifficulty[],
	avatarNode: initials("Mumbo"),
};

const gruntilda = {
	id: "gruntilda",
	displayName: "Gruntilda",
	currentGate: 3,
	pollsInWindow: 1,
	windowSize: 5,
	slots: ["high", "critical", "critical"] as GatePathmapSlotDifficulty[],
	avatarNode: initials("Gruntilda"),
};

export const SinglePlayer: Story = {
	args: {
		players: [banjo],
	},
};

export const TwoPlayers: Story = {
	args: {
		players: [banjo, kazooie],
	},
};

export const MultiplePlayers: Story = {
	args: {
		players: [banjo, kazooie, mumbo],
	},
};

export const SamePositionOverflow: Story = {
	args: {
		players: [
			banjo,
			{
				...kazooie,
				currentGate: 2,
				pollsInWindow: 3,
				slots: ["low", "medium"] as const,
			},
			{
				...mumbo,
				currentGate: 2,
				pollsInWindow: 3,
				slots: ["medium", "high"] as const,
			},
		],
	},
};

export const HighStagePlayers: Story = {
	args: {
		players: [
			{ ...kazooie, currentGate: 7, pollsInWindow: 2 },
			{ ...gruntilda, currentGate: 6, pollsInWindow: 4 },
		],
	},
};

export const CritHeavyPipeline: Story = {
	args: {
		players: [
			{
				...banjo,
				slots: [
					"critical",
					"critical",
					"high",
					"critical",
				] as GatePathmapSlotDifficulty[],
				currentGate: 4,
				pollsInWindow: 0,
				isViewer: true,
			},
		],
	},
};
