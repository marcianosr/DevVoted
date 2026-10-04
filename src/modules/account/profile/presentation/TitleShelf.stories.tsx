import type { Meta, StoryObj } from "@storybook/react";

import {
	titleShelfFor,
	type TitleShelfInput,
} from "~/modules/account/profile/application/titleShelf.viewmodel";
import {
	TITLES,
	titleGroupOf,
} from "~/modules/account/profile/domain/title.model";
import {
	TitleShelf,
	type TitleShelfProps,
} from "~/modules/account/profile/presentation/TitleShelf.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const FRESH: TitleShelfInput = {
	ownedTitleIds: [],
	counts: [],
	filter: "all",
	moreCategories: false,
};

const MID_CLIMB: TitleShelfInput = {
	...FRESH,
	ownedTitleIds: [
		"title-rank-poll-newbie",
		"title-answered-css",
		"title-legacy-tester",
	],
	counts: [
		{ metric: "polls-answered", count: 34 },
		{ metric: "category-seen:css", count: 50 },
		{ metric: "category-mastered:css", count: 28 },
		{ metric: "category-seen:js", count: 35 },
		{ metric: "category-mastered:js", count: 20 },
		{ metric: "category-seen:ts", count: 30 },
		{ metric: "category-mastered:ts", count: 16 },
	],
};

const TOP_RUNG: TitleShelfInput = {
	...MID_CLIMB,
	ownedTitleIds: [
		...MID_CLIMB.ownedTitleIds,
		...TITLES.filter((title) => titleGroupOf(title) === "poll-count").map(
			(title) => title.id
		),
	],
	counts: [{ metric: "polls-answered", count: 900 }],
};

const propsOf = (input: TitleShelfInput): TitleShelfProps => ({
	...titleShelfFor(input),
	onFilter: noop,
	onMoreCategories: noop,
});

const meta: Meta<typeof TitleShelf> = {
	component: TitleShelf,
	title: "Account/TitleShelf",
	args: propsOf(MID_CLIMB),
	render: (args) => (
		<Screen theme="viridian">
			<TitleShelf {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof TitleShelf>;

export const MidClimb: Story = {};

export const Fresh: Story = { args: propsOf(FRESH) };

export const TopRung: Story = { args: propsOf(TOP_RUNG) };

export const Closest: Story = {
	args: propsOf({ ...MID_CLIMB, filter: "closest" }),
};

export const Earned: Story = {
	args: propsOf({ ...MID_CLIMB, filter: "earned" }),
};

export const EveryCategory: Story = {
	args: propsOf({ ...MID_CLIMB, moreCategories: true }),
};
