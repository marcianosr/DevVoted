import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";

import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();

const PrepWithPanels = () => {
	const [open, setOpen] = useState<string | undefined>(undefined);

	return (
		<PrepScreen
			{...props}
			build={{
				...props.build,
				openInfo: open,
				onToggleInfo: (name) => setOpen(name === open ? undefined : name),
			}}
		/>
	);
};

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Kanto/Screens/PrepScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

export const Sealed: Story = { render: () => <PrepScreen {...props} /> };

export const Prefetched: Story = {
	render: () => <PrepScreen {...kantoPrepPrefetched()} />,
};

export const Champion: Story = {
	render: () => <PrepScreen {...kantoPrepChampion()} />,
};

export const CalibrationGate: Story = {
	render: () => <PrepScreen {...kantoPrepCalibration()} />,
};

export const FatalMiss: Story = {
	render: () => <PrepScreen {...kantoPrepFatal()} />,
};

export const PollsSpent: Story = {
	render: () => <PrepScreen {...kantoPrepSpent()} />,
};

export const WithPanels: Story = { render: () => <PrepWithPanels /> };
