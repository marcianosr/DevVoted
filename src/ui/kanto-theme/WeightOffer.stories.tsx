import type { Meta, StoryObj } from "@storybook/react";

import {
	FIRST_SHOP_BALANCE_KB,
	KANTO_PLAN_PEAK_KB,
	kantoWeightOffers,
} from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { WeightOffer } from "./WeightOffer.ui";

const COLUMN = "flex w-full flex-col gap-3";

const noop = () => {};

const meta: Meta<typeof WeightOffer> = {
	component: WeightOffer,
	title: "Kanto/WeightOffer",
	args: { from: 4, to: 8, price: "256 KB", onPress: noop },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<WeightOffer {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof WeightOffer>;

export const Affordable: Story = {};

export const Short: Story = {
	args: { refusal: "160 KB short", onPress: undefined },
};

export const Armed: Story = {
	args: { armed: true },
};

export const ATallClimb: Story = {
	args: { from: 8, to: 16, price: "2 MB" },
};

export const Locked: Story = {
	args: {
		from: undefined,
		to: 12,
		price: undefined,
		onPress: undefined,
		opensAt: "opens once a run has held 768 KB",
	},
};

export const BothRowsAsTheShopDraws: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				{kantoWeightOffers(0, KANTO_PLAN_PEAK_KB, 512).map((offer) => (
					<WeightOffer key={offer.to} {...offer} />
				))}
			</div>
		</Screen>
	),
};

export const NothingAffordableYet: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={COLUMN}>
				{kantoWeightOffers(0, 0, FIRST_SHOP_BALANCE_KB).map((offer) => (
					<WeightOffer key={offer.to} {...offer} />
				))}
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={COLUMN}>
						<WeightOffer from={4} to={8} price="256 KB" onPress={noop} />
						<WeightOffer to={12} opensAt="opens once a run has held 768 KB" />
					</div>
				</Screen>
			))}
		</div>
	),
};
