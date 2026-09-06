import type { Meta, StoryObj } from "@storybook/react";

import { SlotTrack } from "./SlotTrack.ui";

const noop = () => {};

const meta: Meta<typeof SlotTrack> = {
	component: SlotTrack,
	title: "Terminal/SlotTrack",
	decorators: [
		(Story) => (
			<div className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof SlotTrack>;

export const ShopBuild: Story = {
	args: {
		reading: "4 of 6 slots",
		slots: 6,
		segments: [{ slots: 1 }, { slots: 1 }, { slots: 2 }],
	},
};

export const SittingOutGap: Story = {
	args: {
		slots: 6,
		segments: [
			{ slots: 1 },
			{ slots: 1, open: true },
			{ slots: 2 },
			{ slots: 1 },
		],
	},
};

export const Empty: Story = { args: { slots: 4, segments: [] } };

export const BuyTheNextSlot: Story = {
	args: {
		reading: "0 of 4 slots",
		slots: 4,
		segments: [],
		buy: { label: "Buy slot 5", price: "32 KB", onUse: noop },
	},
};

export const BuyOrHandBack: Story = {
	args: {
		reading: "4 of 6 · 2 free",
		slots: 6,
		segments: [{ slots: 1 }, { slots: 1 }, { slots: 2 }],
		cash: { label: "Hand slot 6 back", price: "32 KB", onUse: noop },
		buy: { label: "Buy slot 7", price: "48 KB", onUse: noop },
	},
};

export const DealsRefused: Story = {
	args: {
		reading: "12 of 12 · 0 free",
		slots: 12,
		segments: [{ slots: 8 }, { slots: 4 }],
		cash: {
			label: "Hand slot 12 back",
			price: "160 KB",
			refusal: "Every slot is filled — uninstall or minify first.",
		},
		buy: {
			label: "Buy slot 13",
			price: "240 KB",
			refusal: "Costs 240 KB, you have 96.",
		},
	},
};

/** The ladder's last rung: nothing is for sale past the 24th, so no buy press. */
export const SoldOut: Story = {
	args: {
		reading: "20 of 24 · 4 free",
		slots: 24,
		segments: [{ slots: 16 }, { slots: 4 }],
		cash: { label: "Hand slot 24 back", price: "1792 KB", onUse: noop },
	},
};
