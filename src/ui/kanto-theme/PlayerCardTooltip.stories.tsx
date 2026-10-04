import type { Meta, StoryObj } from "@storybook/react";

import { kantoClimberCard } from "~/test/kantoCommunity.factory";

import { PlayerCardTooltip } from "./PlayerCardTooltip.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof PlayerCardTooltip> = {
	component: PlayerCardTooltip,
	title: "Kanto/PlayerCardTooltip",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PlayerCardTooltip>;

const PLACEMENT = { left: 16, top: 16, width: 448, maxHeight: 640 };

const hoverCard = kantoClimberCard({ profileHref: undefined });

export const ARivalHoveredOn: Story = {
	render: () => (
		<Screen theme="lavender">
			<PlayerCardTooltip card={hoverCard} placement={PLACEMENT} />
		</Screen>
	),
};

export const APlayerWithNoRunOpen: Story = {
	render: () => (
		<Screen theme="lavender">
			<PlayerCardTooltip
				card={{ ...hoverCard, name: "Oak", standing: undefined }}
				placement={PLACEMENT}
			/>
		</Screen>
	),
};
