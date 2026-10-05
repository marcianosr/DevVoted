import type { Meta, StoryObj } from "@storybook/react";

import { advertisementPropsFor } from "~/modules/account/profile/application/advertisement.viewmodel";
import { findBorderById } from "~/modules/account/profile/domain/border.model";
import { AdvertisementCard } from "~/modules/account/profile/presentation/AdvertisementCard.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const MISTY = { name: "Misty" };
const MISTY_PROFILE = "/profile/misty";
const RAREWARE = findBorderById("border-rareware");

const SUGGEST = advertisementPropsFor(
	{ kind: "suggest" },
	MISTY,
	MISTY_PROFILE
);

const meta: Meta<typeof AdvertisementCard> = {
	component: AdvertisementCard,
	title: "Account/AdvertisementCard",
	args: { ...SUGGEST, onDismiss: noop },
	render: (args) => (
		<Screen theme="pewter" width="wide">
			<AdvertisementCard {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof AdvertisementCard>;

export const PollEditors: Story = {};

export const Border: Story = {
	args: RAREWARE
		? advertisementPropsFor(
				{ kind: "border", border: RAREWARE },
				MISTY,
				MISTY_PROFILE
			)
		: SUGGEST,
};

export const PollStrip: Story = {
	args: { variant: "strip", onDismiss: undefined },
};

export const Banner: Story = {
	args: { variant: "banner" },
};
