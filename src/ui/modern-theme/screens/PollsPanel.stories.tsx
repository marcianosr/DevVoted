import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { FilterOption } from "../Filter.ui";
import { PollsPanel, type DexPoll } from "./PollsPanel.ui";

const meta: Meta<typeof PollsPanel> = {
	component: PollsPanel,
	title: "Modern/Screens/PollsPanel",
	// Storybook reads every named export as a story; PollsBrowsing is a helper
	// other story files import, not something to render.
	excludeStories: ["PollsBrowsing"],
	parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof PollsPanel>;

const FILTERS: readonly FilterOption[] = [
	{ id: "seen", label: "seen", count: "23" },
	{ id: "mastered", label: "mastered", count: "14" },
	{ id: "fumbled", label: "fumbled", count: "9" },
	{ id: "all", label: "all", count: "418" },
];

const CATEGORIES = [
	{ id: "any", label: "any category" },
	{ id: "typescript", label: "typescript" },
	{ id: "javascript", label: "javascript" },
	{ id: "css", label: "css" },
	{ id: "python", label: "python" },
];

const SEEN: readonly DexPoll[] = [
	{
		id: "0412",
		number: 412,
		seen: true,
		question:
			"Don't ask me why these polls all rhyme, the seed just does that sometimes",
		category: "typescript",
		timesSeen: 3,
		accuracy: 100,
	},
	{
		id: "0187",
		number: 187,
		seen: true,
		question: "Which array method returns a shallow copy?",
		category: "javascript",
		timesSeen: 2,
		accuracy: 100,
	},
	{
		id: "0233",
		number: 233,
		seen: true,
		question: "Select every property that creates a stacking context",
		category: "css",
		timesSeen: 4,
		accuracy: 50,
	},
	{
		id: "0301",
		number: 301,
		seen: true,
		question: "Which Python built-in returns an iterator of tuples?",
		category: "python",
		timesSeen: 1,
		accuracy: 0,
	},
	{
		id: "0044",
		number: 44,
		seen: true,
		question: "What does a bare `git switch -` do?",
		category: "git",
		timesSeen: 1,
		accuracy: null,
	},
];

const UNMET: readonly DexPoll[] = [
	{ id: "0002", number: 2, seen: false },
	{ id: "0003", number: 3, seen: false },
	{ id: "0005", number: 5, seen: false },
];

const UNMET_COUNT = 395;

/** Exported so the Dex shell's Polls story gets the same working filters and
 * reveal toggle, rather than a frozen snapshot of them. */
// State lives in the story, so the panel stays hook-free per ADR-010.
export const PollsBrowsing = ({ start = false }: { start?: boolean }) => {
	const [activeFilter, setActiveFilter] = useState("seen");
	const [category, setCategory] = useState("any");
	const [shown, setShown] = useState(start);

	return (
		<PollsPanel
			filters={FILTERS}
			activeFilter={activeFilter}
			onFilter={setActiveFilter}
			categories={CATEGORIES}
			category={category}
			onCategory={setCategory}
			polls={shown ? [...SEEN, ...UNMET] : SEEN}
			unmet={{
				count: UNMET_COUNT,
				shown,
				onToggle: () => setShown((on) => !on),
			}}
		/>
	);
};

export const Seen: Story = { render: () => <PollsBrowsing /> };

export const Redacted: Story = { render: () => <PollsBrowsing start /> };

export const NothingHidden: Story = {
	args: {
		filters: FILTERS,
		activeFilter: "all",
		onFilter: () => {},
		categories: CATEGORIES,
		category: "any",
		onCategory: () => {},
		polls: SEEN,
	},
};
