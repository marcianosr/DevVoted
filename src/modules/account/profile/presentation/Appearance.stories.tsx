import type { Meta, StoryObj } from "@storybook/react";

import { appearanceFor } from "~/modules/account/profile/application/appearance.viewmodel";
import {
	Appearance,
	type AppearanceProps,
} from "~/modules/account/profile/presentation/Appearance.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const MISTY = appearanceFor({
	identity: {
		displayName: "misty_cerulean",
		githubUsername: null,
		photoUrl: null,
		borderUrl: null,
		wornTitles: [],
		pollsAnswered: 120,
	},
	look: {
		borderId: "border-00b9a62e",
		titleIds: ["title-rank-poll-newbie", "title-legacy-tester"],
	},
	tryingOnId: null,
	ownedBorderIds: ["border-00b9a62e", "border-0a006140"],
	ownedTitleIds: [
		"title-rank-poll-newbie",
		"title-legacy-tester",
		"title-answered-css",
	],
});

const ARGS: AppearanceProps = {
	...MISTY,
	canSave: false,
	onPickBorder: noop,
	onToggleTitle: noop,
	onMoreBorders: noop,
	onMoreTitles: noop,
	onSave: noop,
};

const meta: Meta<typeof Appearance> = {
	component: Appearance,
	title: "Account/Appearance",
	args: ARGS,
	render: (args) => (
		<Screen theme="fuchsia">
			<Appearance {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Appearance>;

export const Saved: Story = {};

export const Changed: Story = { args: { canSave: true } };

export const TryingOn: Story = {
	args: { tryingOn: "Magenta Glow", canSave: true },
};

export const Refused: Story = {
	args: { canSave: true, error: "Cannot wear a border you don't own" },
};
