import { useState, type ReactNode } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	dexAuditsProps,
	dexConfigsProps,
	dexPollsProps,
	dexRunsProps,
	dexSwatchesProps,
} from "~/test/dexRegistry.factory";

import type { KantoColor } from "./colors";
import { DexAudits } from "./DexAudits.ui";
import { DexConfigs } from "./DexConfigs.ui";
import { DexPolls } from "./DexPolls.ui";
import { DexRuns } from "./DexRuns.ui";
import { DexScreen } from "./DexScreen.ui";
import { DexSwatches } from "./DexSwatches.ui";

const meta: Meta<typeof DexScreen> = {
	component: DexScreen,
	title: "Kanto/Screens/DexScreen",
	parameters: { controls: { disable: true }, layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof DexScreen>;

const TABS = [
	{ id: "polls", label: "polls" },
	{ id: "configs", label: "configs" },
	{ id: "audits", label: "audits" },
	{ id: "swatches", label: "swatches" },
	{ id: "runs", label: "runs" },
];

const THEME: Record<string, KantoColor> = {
	polls: "cerulean",
	configs: "pallet",
	audits: "saffron",
	swatches: "lavender",
	runs: "pewter",
};

const PANELS: Record<string, ReactNode> = {
	polls: <DexPolls {...dexPollsProps()} />,
	configs: <DexConfigs {...dexConfigsProps()} />,
	audits: <DexAudits {...dexAuditsProps()} />,
	swatches: <DexSwatches {...dexSwatchesProps()} />,
	runs: <DexRuns {...dexRunsProps()} />,
};

const Browsable = ({ start }: { start: string }) => {
	const [activeId, setActiveId] = useState(start);

	return (
		<DexScreen
			tabs={TABS}
			activeId={activeId}
			onSelect={setActiveId}
			theme={THEME[activeId]}
			archive="8.2 MB archive"
		>
			{PANELS[activeId]}
		</DexScreen>
	);
};

export const Polls: Story = { render: () => <Browsable start="polls" /> };
export const Configs: Story = { render: () => <Browsable start="configs" /> };
export const Audits: Story = { render: () => <Browsable start="audits" /> };
export const Swatches: Story = { render: () => <Browsable start="swatches" /> };
export const Runs: Story = { render: () => <Browsable start="runs" /> };
