import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoPrepCalibration,
	kantoPrepChampion,
	kantoPrepFatal,
	kantoPrepPrefetched,
	kantoPrepSealed,
	kantoPrepSecondGate,
	kantoPrepSpent,
} from "~/test/kantoPoll.factory";
import { kantoAttackPanel } from "~/test/kantoIncidents.factory";

import { PrepScreen } from "./PrepScreen.ui";

const props = kantoPrepSealed();

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Kanto/Screens/PrepScreen",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

export const Sealed: Story = { render: () => <PrepScreen {...props} /> };

/** A PERFECT close armed an attack: three rivals, two payloads each (ADR-099). */
export const Armed: Story = {
	render: () => <PrepScreen {...props} attack={kantoAttackPanel()} />,
};

export const Prefetched: Story = {
	render: () => <PrepScreen {...kantoPrepPrefetched()} />,
};

export const Champion: Story = {
	render: () => <PrepScreen {...kantoPrepChampion()} />,
};

/** The first gate that can end a run: a thin Pallet opens Boulder in DANGER (ADR-094). */
export const SecondGate: Story = {
	render: () => <PrepScreen {...kantoPrepSecondGate()} />,
};

export const CalibrationGate: Story = {
	render: () => <PrepScreen {...kantoPrepCalibration()} />,
};

export const UnderTheFloor: Story = {
	render: () => <PrepScreen {...kantoPrepFatal()} />,
};

export const PollsSpent: Story = {
	render: () => <PrepScreen {...kantoPrepSpent()} />,
};
