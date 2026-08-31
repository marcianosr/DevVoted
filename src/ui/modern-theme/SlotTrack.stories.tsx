import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	largestSizeFitting,
	slotsOf,
} from "~/modules/run/config/domain/config.model";

import {
	SlotTrack,
	type SlotTrackConfig,
	type SlotTrackProps,
} from "./SlotTrack.ui";
import { BASE_SLOTS, MAX_SLOTS } from "~/modules/run/run/domain/rules.model";

type ConfigKey = keyof typeof CONFIGS;

const bars = (...keys: readonly ConfigKey[]): SlotTrackConfig[] =>
	keys.map((key) => ({
		id: CONFIGS[key].id,
		label: CONFIGS[key].label,
		slots: slotsOf(CONFIGS[key]),
	}));

const meta: Meta<typeof SlotTrack> = {
	component: SlotTrack,
	title: "Modern/SlotTrack",
	args: { configs: bars("coldStart", "js"), slots: BASE_SLOTS },
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-96 bg-surface p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof SlotTrack>;

export const OpeningWidth: Story = {
	args: { fits: largestSizeFitting(BASE_SLOTS - 3) },
};

export const Empty: Story = {
	args: { configs: [], fits: largestSizeFitting(BASE_SLOTS) },
};

export const PastTheFreeFour: Story = {
	args: {
		configs: bars("coldStart", "js", "ts"),
		slots: 8,
		maxSlots: MAX_SLOTS,
		fits: largestSizeFitting(4),
	},
};

export const RoomFreeAndRoomUnrented: Story = {
	args: {
		configs: bars("js", "jsx"),
		slots: BASE_SLOTS,
		maxSlots: MAX_SLOTS,
		fits: largestSizeFitting(2),
	},
};

export const AByteIsTheBuild: Story = {
	args: {
		configs: bars("freemium"),
		slots: 8,
		fits: largestSizeFitting(0),
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
		slots: 8,
		fits: largestSizeFitting(0),
	},
};

export const OnTheTopRung: Story = {
	args: {
		configs: bars("freemium", "wtfpl", "coldStart"),
		slots: MAX_SLOTS,
		fits: largestSizeFitting(6),
	},
};

export const OverCapacity: Story = {
	args: {
		configs: bars("freemium", "coldStart"),
		slots: 8,
	},
};

const SELLING = {
	configs: bars("js", "jsx"),
	slots: 5,
	maxSlots: MAX_SLOTS,
	fits: largestSizeFitting(3),
	buy: { costKb: 32, makes: 6, onUse: () => {} },
	cash: { costKb: 16, makes: 4, onUse: () => {} },
} satisfies SlotTrackProps;

export const SellingRoom: Story = { args: SELLING };

export const ArmedToBuy: Story = {
	args: { ...SELLING, buy: { ...SELLING.buy, armed: true } },
};

export const ArmedToCash: Story = {
	args: { ...SELLING, cash: { ...SELLING.cash, armed: true } },
};

export const CannotAfford: Story = {
	args: {
		...SELLING,
		buy: {
			costKb: 32,
			refusal: "Costs 32 KB, you have 12.",
			onUse: () => {},
		},
	},
};

export const Minified: Story = {
	args: {
		configs: [
			{ ...bars("freemium")[0], slots: 4, minified: true },
			...bars("js", "ts"),
		],
		slots: 8,
		fits: largestSizeFitting(2),
	},
};
