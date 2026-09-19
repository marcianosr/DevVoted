import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";

import {
	createKantoNewRunScreenProps,
	kantoNewRunRegistry,
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
			registry={{ ...props.registry, openInfo: open, onToggleInfo: toggle }}
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

export const NothingSuggested: Story = {
	render: () => (
		<NewRunScreen
			{...props}
			registry={kantoNewRunRegistry([], BASE_SLOTS, false)}
		/>
	),
};

export const Framed: Story = {
	render: () => <NewRunScreen {...props} ground="framed" />,
};
