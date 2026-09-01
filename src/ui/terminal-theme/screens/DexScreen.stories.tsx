import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { TabItem } from "../Tabs.ui";
import { AuditsPanel } from "./AuditsPanel.ui";
import { dexAudits } from "./AuditsPanel.stories";
import { ConfigsPanel } from "./ConfigsPanel.ui";
import { dexConfigs } from "./ConfigsPanel.stories";
import { DexScreen } from "./DexScreen.ui";
import { GatesPanel } from "./GatesPanel.ui";
import { dexGates } from "./GatesPanel.stories";
import { PollsPanel } from "./PollsPanel.ui";
import { dexCategories } from "./PollsPanel.stories";
import { SwatchesPanel } from "./SwatchesPanel.ui";
import { dexSwatches } from "./SwatchesPanel.stories";

/** One account, standing at gate 8 with gates 0–7 cleared. Every count here is
 * the length of the roster behind its tab, and every numerator is what that one
 * account has reached — Gates and Swatches read the same because clearing a
 * gate is what awards its swatch. */
const TABS: readonly TabItem[] = [
	{ id: "polls", label: "Polls", count: "118/423" },
	{ id: "configs", label: "Configs", count: "22/30" },
	{ id: "audits", label: "Audits", count: "7/15" },
	{ id: "gates", label: "Gates", count: "8/13" },
	{ id: "swatches", label: "Swatches", count: "8/13" },
];

const meta: Meta<typeof DexScreen> = {
	component: DexScreen,
	title: "Terminal/Screens/Dex",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof DexScreen>;

// Every bit of state lives here, so the screen and its five panels stay
// hook-free per ADR-010.
const Browsing = ({ start }: { start: string }) => {
	const [activeId, setActiveId] = useState(start);
	const [configView, setConfigView] = useState("slots");
	const [configId, setConfigId] = useState<string | undefined>("overclock");
	const [pollView, setPollView] = useState("category");

	return (
		<DexScreen tabs={TABS} activeId={activeId} onSelect={setActiveId}>
			{activeId === "polls" ? (
				<PollsPanel
					categories={dexCategories}
					view={pollView}
					onView={setPollView}
				/>
			) : null}
			{activeId === "configs" ? (
				<ConfigsPanel
					configs={dexConfigs}
					view={configView}
					onView={setConfigView}
					selectedId={configId}
					onSelect={(id) =>
						setConfigId((current) => (current === id ? undefined : id))
					}
				/>
			) : null}
			{activeId === "audits" ? <AuditsPanel classes={dexAudits} /> : null}
			{activeId === "gates" ? <GatesPanel gates={dexGates} /> : null}
			{activeId === "swatches" ? (
				<SwatchesPanel swatches={dexSwatches} />
			) : null}
		</DexScreen>
	);
};

export const Configs: Story = { render: () => <Browsing start="configs" /> };

export const Polls: Story = { render: () => <Browsing start="polls" /> };

export const Audits: Story = { render: () => <Browsing start="audits" /> };

export const Gates: Story = { render: () => <Browsing start="gates" /> };

export const Swatches: Story = { render: () => <Browsing start="swatches" /> };

export const Mobile: Story = {
	...Configs,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px] bg-zinc-900 p-3">
				<Story />
			</div>
		),
	],
};
