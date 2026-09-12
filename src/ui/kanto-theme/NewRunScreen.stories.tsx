import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	createKantoNewRunScreenProps,
	freeWeightAt,
	kantoHandProps,
	kantoNewRunAt,
} from "~/test/kantoPoll.factory";

import { NewRunScreen } from "./NewRunScreen.ui";

const props = createKantoNewRunScreenProps();

const NewRunWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);
	const toggle = (name: string) => setOpen(name === open ? undefined : name);

	return (
		<NewRunScreen
			{...props}
			build={{ ...props.build, openInfo: open, onToggleInfo: toggle }}
			hand={{ ...props.hand, openInfo: open, onToggleInfo: toggle }}
		/>
	);
};

const meta: Meta<typeof NewRunScreen> = {
	component: NewRunScreen,
	title: "Kanto/Screens/NewRunScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof NewRunScreen>;

export const NothingPicked: Story = {
	render: () => <NewRunScreen {...props} />,
};

export const WithPanels: Story = { render: () => <NewRunWithPanels /> };

export const OnePicked: Story = {
	render: () => <NewRunScreen {...kantoNewRunAt(["js"])} />,
};

export const BuildFull: Story = {
	render: () => (
		<NewRunScreen {...kantoNewRunAt(["js", "code-coverage", "unit-tests"])} />
	),
};

export const WidenedFromTheArchive: Story = {
	render: () => <NewRunScreen {...kantoNewRunAt(["js"], 1, 1024)} />,
};

export const ArchiveTooThin: Story = {
	render: () => <NewRunScreen {...kantoNewRunAt([], 0, 32)} />,
};

export const NothingSuggested: Story = {
	render: () => (
		<NewRunScreen {...props} hand={kantoHandProps([], freeWeightAt(), false)} />
	),
};
