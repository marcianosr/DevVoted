import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	createKantoRegistryProps,
	kantoRegistryOffers,
} from "~/test/kantoPoll.factory";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { Registry } from "./Registry.ui";

const RegistryWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<Screen theme="pewter">
			<Registry
				{...createKantoRegistryProps()}
				openInfo={open}
				onToggleInfo={(name) => setOpen(name === open ? undefined : name)}
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

export const NoControls: Story = { args: { controls: [] } };

export const AllAffordable: Story = {
	args: { offers: kantoRegistryOffers.slice(1, 4) },
};

export const OneInfoOpen: Story = {
	parameters: { controls: { disable: true } },
	render: () => <RegistryWithPanels />,
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
