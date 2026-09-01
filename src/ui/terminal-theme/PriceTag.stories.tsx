import type { Meta, StoryObj } from "@storybook/react";

import { PriceTag } from "./PriceTag.ui";
import { Text } from "./Text.ui";

const noop = () => {};

const meta: Meta<typeof PriceTag> = {
	component: PriceTag,
	title: "Terminal/PriceTag",
	decorators: [
		(Story) => (
			<div className="bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof PriceTag>;

export const YouCanPayIt: Story = { args: { label: "32 KB" } };

export const YouCannot: Story = {
	args: { label: "128 KB", variant: "short" },
};

export const Armed: Story = {
	args: { label: "confirm 64 KB", variant: "armed", onUse: noop },
};

export const Recurring: Story = {
	args: { label: "16 KB a gate", variant: "recurring" },
};

export const YouReceive: Story = {
	args: { label: "96 KB", variant: "receive" },
};

export const Billed: Story = {
	args: { label: "−128 KB", variant: "bill" },
};

export const WhichWayTheStorageMoves: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<span className="flex items-center gap-3">
				<PriceTag label="32 KB" />
				<Text tone="muted" size="caption">
					it costs you: the point leads left
				</Text>
			</span>
			<span className="flex items-center gap-3">
				<PriceTag label="96 KB" variant="receive" />
				<Text tone="muted" size="caption">
					it pays you: the point leads right
				</Text>
			</span>
		</div>
	),
};

export const EveryTag: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
			<PriceTag label="32 KB" />
			<Text tone="muted" size="caption">
				you can pay it
			</Text>
			<PriceTag label="128 KB" variant="short" />
			<Text tone="muted" size="caption">
				you can&apos;t
			</Text>
			<PriceTag label="confirm 64 KB" variant="armed" onUse={noop} />
			<Text tone="muted" size="caption">
				armed
			</Text>
			<PriceTag label="16 KB a gate" variant="recurring" />
			<Text tone="muted" size="caption">
				recurring
			</Text>
			<PriceTag label="−128 KB" variant="bill" />
			<Text tone="muted" size="caption">
				it bills you
			</Text>
			<PriceTag label="96 KB" variant="receive" />
			<Text tone="muted" size="caption">
				you receive
			</Text>
		</div>
	),
};
