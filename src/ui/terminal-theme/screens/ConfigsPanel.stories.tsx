import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	baseSlotsOf,
	maxLevelOf,
} from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { CONFIG_UNLOCKS } from "~/modules/run/config/domain/configUnlock.model";
import {
	fallbackCaptionFor,
	provenanceOf,
	thematicCaptionFor,
} from "~/modules/run/config/domain/unlockCaption.model";

import { Panel } from "../Panel.ui";
import {
	ConfigsPanel,
	type DexConfig,
	type LockedState,
	type UnlockedState,
} from "./ConfigsPanel.ui";

/** One account's history against the real roster: a config missing from this
 * table has never been dealt, so the counts under each slot header add up on
 * their own rather than being typed in beside the chips. 22 of 35 seen.
 * `viaFallback` picks which unlock path paid out, and only makes sense on a
 * config whose thematic objective this account never met. */
const HISTORY: Readonly<
	Record<
		string,
		{
			best: number;
			installs: number;
			firstSeenGate: number;
			viaFallback?: true;
		}
	>
> = {
	js: { best: 5, installs: 41, firstSeenGate: 0 },
	ts: { best: 3, installs: 17, firstSeenGate: 0 },
	css: { best: 2, installs: 24, firstSeenGate: 0 },
	jsx: { best: 1, installs: 15, firstSeenGate: 1 },
	git: { best: 2, installs: 0, firstSeenGate: 2 },
	html: { best: 1, installs: 2, firstSeenGate: 5 },
	java: { best: 1, installs: 0, firstSeenGate: 3, viaFallback: true },
	py: { best: 4, installs: 9, firstSeenGate: 1, viaFallback: true },
	"package.json-config": { best: 2, installs: 7, firstSeenGate: 4 },
	".vue": { best: 1, installs: 0, firstSeenGate: 6, viaFallback: true },
	"unit-tests": { best: 1, installs: 0, firstSeenGate: 2 },
	eslint: { best: 3, installs: 33, firstSeenGate: 0 },
	stylelint: { best: 2, installs: 5, firstSeenGate: 4 },
	"moores-law": { best: 1, installs: 4, firstSeenGate: 5, viaFallback: true },
	"code-coverage": { best: 2, installs: 0, firstSeenGate: 3 },
	"indexed-db": { best: 2, installs: 22, firstSeenGate: 2 },
	telemetry: { best: 2, installs: 12, firstSeenGate: 4 },
	length: { best: 1, installs: 0, firstSeenGate: 6 },
	"cold-start": { best: 1, installs: 6, firstSeenGate: 5 },
	intellisense: { best: 1, installs: 3, firstSeenGate: 8 },
	deprecated: { best: 2, installs: 19, firstSeenGate: 6 },
	overclock: { best: 4, installs: 28, firstSeenGate: 7 },
};

/** The same account's objective counters, and the reason the page holds
 * together: every locked config sits under both its thematic target and its
 * polls-answered fallback, so nothing here is unlocked by a counter it also
 * shows as unmet. Metrics absent from this table stand at zero. */
const PROGRESS: Readonly<Record<string, number>> = {
	"polls-answered": 412,
	"category-correct:ruby": 6,
	"audited-gates-cleared": 3,
	"configs-sold": 12,
	"offers-locked": 2,
	"exact-estimates": 1,
	"cache-hits": 4,
};

/** Earned and never dealt: 412 answered polls cleared their fallback long ago,
 * but the shop has not offered either one yet. */
const GRANTED_NEVER_DEALT: readonly string[] = ["rb", "prefetch"];

const countOf = (metric: string): number => PROGRESS[metric] ?? 0;

const provenanceFor = (configId: string, viaFallback: boolean): string => {
	const unlock = CONFIG_UNLOCKS[configId];
	if (unlock === undefined || unlock.kind === "free")
		return provenanceOf(configId, null);

	return provenanceOf(
		configId,
		viaFallback ? "polls-answered" : unlock.objective.metric
	);
};

const unseenUnlock = (configId: string): UnlockedState | LockedState => {
	const unlock = CONFIG_UNLOCKS[configId];
	if (unlock === undefined || unlock.kind === "free")
		return { state: "unlocked", provenance: provenanceOf(configId, null) };

	if (GRANTED_NEVER_DEALT.includes(configId))
		return { state: "unlocked", provenance: provenanceFor(configId, true) };

	return {
		state: "locked",
		thematic: thematicCaptionFor(unlock, countOf(unlock.objective.metric)),
		fallback: fallbackCaptionFor(unlock, countOf("polls-answered")),
	};
};

export const dexConfigs: readonly DexConfig[] = CONFIG_LIST.map(
	(config): DexConfig => {
		const identity = {
			id: config.id,
			slots: baseSlotsOf(config),
		};
		const history = HISTORY[config.id];
		if (history === undefined)
			return { ...identity, seen: false, unlock: unseenUnlock(config.id) };

		return {
			...identity,
			unlock: {
				state: "unlocked",
				provenance: provenanceFor(config.id, history.viaFallback === true),
			},
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
