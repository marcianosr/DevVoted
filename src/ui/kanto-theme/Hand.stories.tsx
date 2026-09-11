import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { baseSlots, kantoHandProps } from "~/test/kantoPoll.factory";

import { Hand } from "./Hand.ui";
import { Screen } from "./Screen.ui";

const props = kantoHandProps();

const HandOnAScreen = ({ children }: { children: React.ReactNode }) => (
	<Screen theme="viridian" width="narrow">
		{children}
	</Screen>
);

const HandWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<HandOnAScreen>
			<Hand
				{...props}
				openInfo={open}
				onToggleInfo={(name) => setOpen(name === open ? undefined : name)}
			/>
		</HandOnAScreen>
	);
};

const meta: Meta<typeof Hand> = {
	component: Hand,
	title: "Kanto/Hand",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<HandOnAScreen>
			<Hand {...args} />
		</HandOnAScreen>
	),
	args: props,
};
export default meta;

type Story = StoryObj<typeof Hand>;

export const Dealt: Story = {};

export const OneTaken: Story = { args: kantoHandProps(["js"]) };

export const NothingFits: Story = {
	args: kantoHandProps(["js", "code-coverage", "unit-tests"]),
};

export const NothingSuggested: Story = {
	args: kantoHandProps([], baseSlots, false),
};

export const WithPanels: Story = { render: () => <HandWithPanels /> };
