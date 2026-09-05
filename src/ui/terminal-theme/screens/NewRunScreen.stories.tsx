import type { Meta, StoryObj } from "@storybook/react";

import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { recommendedPicks } from "~/modules/run/config/domain/hand.model";

import { NewRunScreen, type DealRow } from "./NewRunScreen.ui";

const noop = () => {};

const meta: Meta<typeof NewRunScreen> = {
	component: NewRunScreen,
	title: "Terminal/Screens/NewRun",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof NewRunScreen>;

const hand: readonly Config[] = [
	CONFIGS.js,
	CONFIGS.codeCoverage,
	CONFIGS.unitTests,
	CONFIGS.coldStart,
	CONFIGS.eslint,
];

const suggested = new Set(recommendedPicks(hand, 4).map((config) => config.id));

const dealRows: readonly DealRow[] = hand.map((config) => ({
	name: config.label,
	detail: config.description,
	slots: slotsOf(config),
	version: 1,
	selected: false,
	toggleLabel: `Install ${config.label}`,
	onToggle: noop,
	recommended: suggested.has(config.id),
}));

const palletStorage = {
	meta: "0 of 4 slots",
	slots: 4,
	slotRows: [
		{
			name: "Slot 5",
			label: "Buy slot 5",
			detail: "The fifth is the last one this plan allows",
			price: "32 KB",
			onUse: noop,
		},
	],
};

export const RecommendedDeal: Story = {
	args: {
		header: {
			title: "New run",
			subtitle: "Pallet gate · 3% coverage · miss removes 1 slot",
			swatch: "pallet",
			value: "512 KB",
			caption: "archive",
		},
		theme: "pallet",
		dealt: {
			meta: `0 of ${hand.length} picked`,
			rows: dealRows,
		},
		storage: palletStorage,
		startLabel: "Pick a config to start",
		onStart: undefined,
	},
};

export const OnePicked: Story = {
	args: {
		...RecommendedDeal.args,
		dealt: {
			meta: `1 of ${hand.length} picked`,
			rows: dealRows.map((row, index) =>
				index === 0
					? {
							...row,
							selected: true,
							toggleLabel: `Uninstall ${row.name}`,
							recommended: false,
						}
					: row
			),
		},
		storage: { ...palletStorage, meta: "1 of 4 slots" },
		startLabel: "Start the run →",
		onStart: noop,
	},
};

export const Mobile: Story = {
	...RecommendedDeal,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const NothingSuggested: Story = {
	args: {
		...RecommendedDeal.args,
		dealt: {
			meta: `0 of ${hand.length} picked`,
			rows: dealRows.map((row) => ({ ...row, recommended: false })),
		},
	},
};

export const TaggedAtSeafoam: Story = {
	args: {
		...RecommendedDeal.args,
		header: {
			title: "New run",
			subtitle: "Seafoam gate · git tag checkout · miss removes 2 slots",
			swatch: "seafoam",
			value: "1.9 MB",
			caption: "archive",
		},
		theme: "seafoam",
		gitTag: {
			title: "Restored from your git tag",
			detail:
				"You start at gate 8 with the build you saved, instead of gate 0 with four slots. The tag is spent — save another in a shop to keep this run.",
		},
		storage: {
			meta: "15 of 16 slots",
			slots: 16,
			slotRows: [
				{
					name: "Slot 16 · empty",
					label: "Hand slot 16 back",
					price: "192 KB",
					receives: true,
					onUse: noop,
				},
				{
					name: "Slot 17",
					label: "Buy slot 17",
					detail: "Every slot after this one costs double",
					price: "256 KB",
					onUse: noop,
				},
			],
		},
	},
};

export const TaggedAtSeafoamMobile: Story = {
	...TaggedAtSeafoam,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
