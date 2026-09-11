import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { slotDealsAt } from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { SlotOffer } from "./SlotOffer.ui";

const COLUMN = "flex w-full flex-col gap-3";

const RICH = 4096;

const offerAt = (capacity?: number, balance?: number) =>
	slotDealsAt(capacity, balance).offer;

const ArmingOffer = () => {
	const [armed, setArmed] = useState(false);
	const offer = offerAt(10, RICH);

	if (offer === undefined) return null;

	return (
		<SlotOffer {...offer} armed={armed} onPress={() => setArmed(!armed)} />
	);
};

const meta: Meta<typeof SlotOffer> = {
	component: SlotOffer,
	title: "Kanto/SlotOffer",
	argTypes: { slot: { control: { type: "range", min: 5, max: 24 } } },
	args: offerAt(10, RICH),
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<SlotOffer {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SlotOffer>;

export const Affordable: Story = {};

export const Short: Story = {
	args: offerAt(),
};

export const ShortByMore: Story = {
	args: offerAt(11),
};

export const Armed: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter" width="narrow">
			<ArmingOffer />
		</Screen>
	),
};

export const HighRung: Story = {
	args: offerAt(20),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => {
				const affordable = offerAt(10, RICH);
				const refused = offerAt();

				return (
					<Screen key={theme} theme={theme} width="narrow">
						<div className={COLUMN}>
							{affordable === undefined ? null : <SlotOffer {...affordable} />}
							{refused === undefined ? null : <SlotOffer {...refused} />}
						</div>
					</Screen>
				);
			})}
		</div>
	),
};
