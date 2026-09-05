import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	baseSlotsOf,
	maxLevelOf,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";

import { Panel } from "../Panel.ui";
import { ConfigsPanel, type DexConfig } from "./ConfigsPanel.ui";

/** One account's history against the real roster: a config missing from this
 * table has never been dealt, so the counts under each slot header add up on
 * their own rather than being typed in beside the chips. 23 of 33 seen. */
const HISTORY: Readonly<
	Record<string, { best: number; installs: number; firstSeenGate: number }>
> = {
	js: { best: 5, installs: 41, firstSeenGate: 0 },
	ts: { best: 3, installs: 17, firstSeenGate: 0 },
	css: { best: 2, installs: 24, firstSeenGate: 0 },
	jsx: { best: 1, installs: 15, firstSeenGate: 1 },
	git: { best: 2, installs: 0, firstSeenGate: 2 },
	html: { best: 1, installs: 2, firstSeenGate: 5 },
	java: { best: 1, installs: 0, firstSeenGate: 3 },
	py: { best: 4, installs: 9, firstSeenGate: 1 },
	"package.json-config": { best: 2, installs: 7, firstSeenGate: 4 },
	".vue": { best: 1, installs: 0, firstSeenGate: 6 },
	"unit-tests": { best: 1, installs: 0, firstSeenGate: 2 },
	eslint: { best: 3, installs: 33, firstSeenGate: 0 },
	stylelint: { best: 2, installs: 5, firstSeenGate: 4 },
	"moores-law": { best: 1, installs: 4, firstSeenGate: 5 },
	"code-coverage": { best: 2, installs: 0, firstSeenGate: 3 },
	"indexed-db": { best: 2, installs: 22, firstSeenGate: 2 },
	telemetry: { best: 2, installs: 12, firstSeenGate: 4 },
	length: { best: 1, installs: 0, firstSeenGate: 6 },
	"cold-start": { best: 1, installs: 6, firstSeenGate: 5 },
	intellisense: { best: 1, installs: 3, firstSeenGate: 8 },
	deprecated: { best: 2, installs: 19, firstSeenGate: 6 },
	overclock: { best: 4, installs: 28, firstSeenGate: 7 },
};

export const dexConfigs: readonly DexConfig[] = CONFIG_LIST.map(
	(config): DexConfig => {
		const identity = {
			id: config.id,
			slots: baseSlotsOf(config),
		};
		const history = HISTORY[config.id];
		if (history === undefined) return { ...identity, seen: false };

		return {
			...identity,
			label: config.label,
			best: history.best,
			maxVersion: maxLevelOf(config),
			installs: history.installs,
			firstSeenGate: history.firstSeenGate,
			effect: config.description,
		};
	}
);

const meta: Meta<typeof ConfigsPanel> = {
	component: ConfigsPanel,
	title: "Terminal/Screens/Dex/Configs",
	// Storybook reads every named export as a story, so the data other story
	// files import has to be named here or it renders as a story with no args.
	excludeStories: ["dexConfigs"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ConfigsPanel>;

// Selection and the view switch live in the story, so the panel stays hook-free
// per ADR-010.
const Browsing = ({
	startView,
	startId,
}: {
	startView: string;
	startId?: string;
}) => {
	const [view, setView] = useState(startView);
	const [selectedId, setSelectedId] = useState(startId);

	return (
		<ConfigsPanel
			configs={dexConfigs}
			view={view}
			onView={setView}
			selectedId={selectedId}
			onSelect={(id) =>
				setSelectedId((current) => (current === id ? undefined : id))
			}
		/>
	);
};

export const BySlot: Story = {
	render: () => <Browsing startView="slots" startId="overclock" />,
};

export const MostInstalled: Story = {
	render: () => <Browsing startView="installs" startId="overclock" />,
};

export const Unseen: Story = {
	render: () => <Browsing startView="unseen" />,
};

/** Nothing picked: the detail block is absent rather than empty, so the panel
 * does not reserve a slab of page for a thing you have not asked to see. */
export const NothingSelected: Story = {
	render: () => <Browsing startView="slots" />,
};

export const Mobile: Story = {
	...BySlot,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px] bg-zinc-900 p-3">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
