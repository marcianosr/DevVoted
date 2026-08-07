import type { Meta, StoryObj } from "@storybook/react";

import type {
	ClimbClimber,
	ClimbFallen,
} from "~/modules/run/api/community.handlers";

import { ClimbToday } from "./ClimbToday.ui";

const meta: Meta<typeof ClimbToday> = {
	component: ClimbToday,
	title: "Run/ClimbToday",
	// The uncharted zone and its dashed edge read from --theme-color, which the
	// Screen normally sets from the gate being played.
	decorators: [
		(Story) => (
			<div data-gate-theme="soul">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ClimbToday>;

const climber = (
	id: string,
	displayName: string,
	gate: number,
	pollsIntoGate: number,
	you = false
): ClimbClimber => ({ id, displayName, gate, pollsIntoGate, you });

const you = (gate: number, pollsIntoGate: number) =>
	climber("red", "Red", gate, pollsIntoGate, true);

const fallen = (
	runId: number,
	id: string,
	displayName: string,
	gate: number,
	pollsIntoGate: number
): ClimbFallen => ({ runId, id, displayName, gate, pollsIntoGate });

export const MidClimb: Story = {
	args: {
		climbers: [
			climber("brock", "Brock Boulder", 4, 2),
			climber("misty", "Misty Cascade", 5, 4),
			climber("lt-surge", "Lt Surge", 5, 4),
			climber("sabrina", "Sabrina", 6, 1),
			you(6, 3),
			climber("erika", "Erika Rainbow", 7, 2),
		],
		fallen: [
			fallen(11, "koga", "Koga", 4, 3),
			fallen(12, "janine", "Janine", 5, 1),
		],
		bestPosition: 31,
	},
};

export const FirstClimb: Story = {
	args: {
		climbers: [you(1, 2), climber("gary", "Gary Oak", 3, 0)],
		fallen: [],
		bestPosition: null,
	},
};

/** Behind your own ghost: the best marker sits ahead of you. */
export const ChasingYourBest: Story = {
	args: {
		climbers: [you(5, 1), climber("brock", "Brock Boulder", 6, 4)],
		fallen: [fallen(11, "koga", "Koga", 5, 3)],
		bestPosition: 34,
	},
};

/**
 * Deep enough that the unknown is a band rather than the page: this is the only
 * width at which the zone hatches. Compare against MidClimb, where half the
 * window is uncharted and the hatch drops back to a dashed edge.
 */
export const NearingTheSummit: Story = {
	args: {
		climbers: [you(10, 4), climber("gary", "Gary Oak", 12, 1)],
		fallen: [fallen(11, "koga", "Koga", 9, 2)],
		bestPosition: 50,
	},
};

/** The summit: the window pins to the end of the ladder, nothing left uncharted. */
export const Summit: Story = {
	args: {
		climbers: [you(12, 4), climber("gary", "Gary Oak", 11, 2)],
		fallen: [fallen(11, "koga", "Koga", 11, 4)],
		bestPosition: 58,
	},
};

/** A crowded gate — four climbers on one poll collapse into a stack. */
export const CrowdedGate: Story = {
	args: {
		climbers: [
			you(6, 3),
			climber("brock", "Brock Boulder", 6, 3),
			climber("misty", "Misty Cascade", 6, 3),
			climber("erika", "Erika Rainbow", 6, 3),
			climber("koga", "Koga", 6, 3),
		],
		fallen: [],
		bestPosition: 29,
	},
};

/** Nobody else out today. */
export const SoloClimb: Story = {
	args: { climbers: [you(3, 4)], fallen: [], bestPosition: 12 },
};
