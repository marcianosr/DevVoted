import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	OFFERED_CARDS_OPEN,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";
import {
	createKantoRegistryProps,
	kantoRegistryOffers,
} from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { Registry } from "./Registry.ui";

const RegistryWithPanels = () => {
	const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());
	const props = createKantoRegistryProps();

	return (
		<Screen theme="pewter">
			<Registry
				{...props}
				openInfo={disclosedIn(
					props.offers.map((offer) => offer.name ?? ""),
					flipped,
					OFFERED_CARDS_OPEN
				)}
				onToggleInfo={(name) => setFlipped(toggleDisclosure(flipped, name))}
			/>
		</Screen>
	);
};

const meta: Meta<typeof Registry> = {
	component: Registry,
	title: "Kanto/Registry",
	args: createKantoRegistryProps(),
	render: (args) => (
		<Screen theme="pewter">
			<Registry {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Registry>;

export const Default: Story = {};

export const AllAffordable: Story = {
	args: { offers: kantoRegistryOffers.slice(1, 4) },
};

export const FoldingCards: Story = {
	parameters: { controls: { disable: true } },
	render: () => <RegistryWithPanels />,
};

export const InAShopColumn: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div />
				<Registry {...createKantoRegistryProps()} heading={false} />
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:40rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme}>
					<Registry {...createKantoRegistryProps()} />
				</Screen>
			))}
		</div>
	),
};
