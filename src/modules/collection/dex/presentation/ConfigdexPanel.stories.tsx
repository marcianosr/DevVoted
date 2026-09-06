import type { Meta, StoryObj } from "@storybook/react";

import { configdex } from "~/modules/collection/dex/domain/configdex.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { FREE_CONFIG_IDS } from "~/modules/run/config/domain/configUnlock.model";
import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

const meta: Meta<typeof ConfigdexPanel> = {
	component: ConfigdexPanel,
	title: "Dex/ConfigdexPanel",
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-950 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ConfigdexPanel>;

const starters = FREE_CONFIG_IDS.map((configId) => ({
	configId,
	viaMetric: null,
}));

export const EarlyAccount: Story = {
	args: {
		entries: configdex(starters, [
			{ metric: "polls-answered", count: 17 },
			{ metric: "polls-correct", count: 11 },
			{ metric: "community-peeks", count: 3 },
			{ metric: "category-correct:html", count: 6 },
			{ metric: "sold-three-one-shop", count: 1 },
		]),
	},
};

export const MidCollection: Story = {
	args: {
		entries: configdex(
			[
				...starters,
				{ configId: "html", viaMetric: "category-correct:html" },
				{ configId: "telemetry", viaMetric: "community-peeks" },
				{ configId: "jsx", viaMetric: "polls-answered" },
				{ configId: "wtfpl", viaMetric: "sold-three-one-shop" },
			],
			[
				{ metric: "polls-answered", count: 214 },
				{ metric: "polls-correct", count: 151 },
				{ metric: "gates-cleared", count: 9 },
				{ metric: "configs-sold", count: 7 },
				{ metric: "perfect-windows", count: 2 },
			]
		),
	},
};

export const AllCollected: Story = {
	args: {
		entries: configdex(
			CONFIG_LIST.map((config) => ({
				configId: config.id,
				viaMetric: FREE_CONFIG_IDS.includes(config.id)
					? null
					: "polls-answered",
			})),
			[{ metric: "polls-answered", count: 700 }]
		),
	},
};
