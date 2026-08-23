import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../Text.ui";
import type { TabItem } from "../Tabs.ui";
import { AuditsPanel } from "./AuditsPanel.ui";
import { auditsSeen } from "./AuditsPanel.stories";
import { DexScreen } from "./DexScreen.ui";
import { GatesPanel } from "./GatesPanel.ui";
import { gatesClearedTo } from "./GatesPanel.stories";
import { PollsBrowsing } from "./PollsPanel.stories";

const meta: Meta<typeof DexScreen> = {
	component: DexScreen,
	title: "Modern/Screens/Dex",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DexScreen>;

/** Polls' denominator is a live count of published polls and Configs' numerator has
 * no source yet — there is no config-unlock system, so the game ships 30/30. Both
 * are here because the mock has them; neither is a number to build on. */
const TABS: readonly TabItem[] = [
	{ id: "polls", label: "Polls", count: "23/418" },
	{ id: "configs", label: "Configs", count: "12/30" },
	{ id: "swatches", label: "Swatches", count: "1/13" },
	{ id: "audits", label: "Audits", count: "2/11" },
	{ id: "gates", label: "Gates", count: "1/13" },
];

const Placeholder = ({ tab }: { tab: string }) => (
	<Text as="p" size="meta" tone="muted">
		{tab} is not reskinned yet.
	</Text>
);

const Panel = ({ activeId }: { activeId: string }) => {
	if (activeId === "gates") return <GatesPanel gates={gatesClearedTo(1)} />;
	if (activeId === "audits") return <AuditsPanel audits={auditsSeen(2, 4)} />;
	if (activeId === "polls") return <PollsBrowsing />;

	return (
		<Placeholder tab={TABS.find((tab) => tab.id === activeId)?.label ?? ""} />
	);
};

// State lives in the story, so the screen stays hook-free per ADR-010.
const Browsing = ({ start }: { start: string }) => {
	const [activeId, setActiveId] = useState(start);

	return (
		<DexScreen tabs={TABS} activeId={activeId} onSelect={setActiveId}>
			<Panel activeId={activeId} />
		</DexScreen>
	);
};

export const Gates: Story = { render: () => <Browsing start="gates" /> };

export const Audits: Story = { render: () => <Browsing start="audits" /> };

export const Polls: Story = { render: () => <Browsing start="polls" /> };

export const OtherTab: Story = { render: () => <Browsing start="configs" /> };
