import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { CATEGORY_CODES, CATEGORY_METADATA } from "~/shared/lib/categories";

import { Panel } from "../Panel.ui";
import { PollsPanel, type DexCategory } from "./PollsPanel.ui";

/** Seen and total add up to the 118/423 on the Polls tab, so the tab count and
 * the table can never disagree. A category nobody has answered has no rate at
 * all rather than a rate of zero. */
const SEEN: Readonly<
	Record<string, { seen: number; total: number; correct?: number }>
> = {
	js: { seen: 34, total: 72, correct: 79 },
	css: { seen: 21, total: 58, correct: 62 },
	ts: { seen: 15, total: 44, correct: 68 },
	react: { seen: 12, total: 40, correct: 74 },
	python: { seen: 11, total: 38, correct: 71 },
	git: { seen: 9, total: 31, correct: 88 },
	html: { seen: 7, total: 29, correct: 81 },
	java: { seen: 5, total: 26, correct: 55 },
	"general-frontend": { seen: 3, total: 24, correct: 41 },
	vue: { seen: 1, total: 22, correct: 60 },
	ruby: { seen: 0, total: 20 },
	"general-backend": { seen: 0, total: 19 },
};

export const dexCategories: readonly DexCategory[] = CATEGORY_CODES.map(
	(code): DexCategory => ({
		code,
		name: CATEGORY_METADATA[code].name,
		...(SEEN[code] ?? { seen: 0, total: 0 }),
	})
);

const meta: Meta<typeof PollsPanel> = {
	component: PollsPanel,
	title: "Terminal/Screens/Dex/Polls",
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
type Story = StoryObj<typeof PollsPanel>;

const Browsing = ({ startView }: { startView: string }) => {
	const [view, setView] = useState(startView);

	return <PollsPanel categories={dexCategories} view={view} onView={setView} />;
};

export const ByCategory: Story = {
	render: () => <Browsing startView="category" />,
};

/** The reason to build a .java config, ranked: worst rate first. */
export const MostMissed: Story = {
	render: () => <Browsing startView="missed" />,
};

export const Unseen: Story = {
	render: () => <Browsing startView="unseen" />,
};

export const Mobile: Story = {
	...ByCategory,
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
