import type { Meta, StoryObj } from "@storybook/react";

import { appearanceFor } from "~/modules/account/profile/application/appearance.viewmodel";
import {
	Appearance,
	type AppearanceProps,
} from "~/modules/account/profile/presentation/Appearance.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const MISTY = appearanceFor({
	look: {
		borderId: "border-00b9a62e",
		titleIds: ["title-rank-poll-newbie", "title-legacy-tester"],
		swatchId: "swatch-cerulean",
	},
	ownedBorderIds: ["border-00b9a62e", "border-0a006140"],
	ownedTitleIds: [
		"title-rank-poll-newbie",
		"title-legacy-tester",
		"title-answered-css",
	],
	ownedSwatchIds: ["swatch-pewter", "swatch-cerulean"],
});

const ARGS: AppearanceProps = {
	...MISTY,
	onPickBorder: noop,
	onToggleTitle: noop,
	onPickSwatch: noop,
	onMoreBorders: noop,
	onMoreTitles: noop,
};

const meta: Meta<typeof Appearance> = {
	component: Appearance,
	title: "Account/Appearance",
	args: ARGS,
	render: (args) => (
		<Screen theme="fuchsia" width="wide">
			<Appearance {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Appearance>;

export const Picking: Story = {};
