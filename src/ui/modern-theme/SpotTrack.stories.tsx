import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	largestGradeFitting,
	rarityOf,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	BASE_SPOTS,
	MAX_SPOTS,
} from "~/modules/run/pipeline/domain/pipeline.model";

import { SpotTrack, type SpotTrackConfig } from "./SpotTrack.ui";

type ConfigKey = keyof typeof CONFIGS;

const bars = (...keys: readonly ConfigKey[]): SpotTrackConfig[] =>
	keys.map((key) => ({
		id: CONFIGS[key].id,
		label: CONFIGS[key].label,
		spots: spotsOf(CONFIGS[key]),
		rarity: rarityOf(CONFIGS[key]),
	}));

const meta: Meta<typeof SpotTrack> = {
	component: SpotTrack,
	title: "Modern/SpotTrack",
	args: { configs: bars("coldStart", "js"), spots: BASE_SPOTS },
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-96 bg-surface p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof SpotTrack>;

export const OpeningWidth: Story = {
	args: { fits: largestGradeFitting(BASE_SPOTS - 3) },
};

export const Empty: Story = {
	args: { configs: [], fits: largestGradeFitting(BASE_SPOTS) },
};

export const PastTheFreeFour: Story = {
	args: {
		configs: bars("coldStart", "js", "ts"),
		spots: 8,
		maxSpots: MAX_SPOTS,
		fits: largestGradeFitting(4),
	},
};

export const RoomFreeAndRoomUnrented: Story = {
	args: {
		configs: bars("js", "jsx"),
		spots: BASE_SPOTS,
		maxSpots: MAX_SPOTS,
		fits: largestGradeFitting(2),
	},
};

export const AByteIsThePipeline: Story = {
	args: {
		configs: bars("freemium"),
		spots: 8,
		fits: largestGradeFitting(0),
	},
};

export const EightBits: Story = {
	args: {
		configs: bars(
			"js",
			"ts",
			"css",
			"eslint",
			"stylelint",
			"jsx",
			"rb",
			"agentsMd"
		),
		spots: 8,
		fits: largestGradeFitting(0),
	},
};

export const OnTheTopRung: Story = {
	args: {
		configs: bars("freemium", "wtfpl", "coldStart"),
		spots: MAX_SPOTS,
		fits: largestGradeFitting(6),
	},
};

export const OverCapacity: Story = {
	args: {
		configs: bars("freemium", "coldStart"),
		spots: 8,
	},
};

export const Minified: Story = {
	args: {
		configs: [
			{ ...bars("freemium")[0], spots: 4, minified: true },
			...bars("js", "ts"),
		],
		spots: 8,
		fits: largestGradeFitting(2),
	},
};
