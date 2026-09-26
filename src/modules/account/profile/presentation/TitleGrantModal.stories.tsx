import type { Meta, StoryObj } from "@storybook/react";

import {
	TitleGrantModal,
	type TitleGrantModalProps,
} from "~/modules/account/profile/presentation/TitleGrantModal.ui";

const noop = () => {};

const legacyTester = {
	id: "title-legacy-tester",
	name: "Legacy Tester",
	earnedWhen: "Played before the rebuild. Cannot be earned.",
	worn: false,
};

const legacyClimber = {
	id: "title-legacy-active",
	name: "Legacy Climber",
	earnedWhen: "Still climbing when the rebuild landed. Cannot be earned.",
	worn: true,
};

const base: TitleGrantModalProps = {
	titles: [legacyTester],
	archivedOn: "14 Aug 2026",
	onWear: noop,
	onDismiss: noop,
};

const meta: Meta<typeof TitleGrantModal> = {
	component: TitleGrantModal,
	title: "Account/TitleGrantModal",
};
export default meta;

type Story = StoryObj<typeof TitleGrantModal>;

export const PlayedTheOldGame: Story = { args: base };

export const CaughtMidClimb: Story = {
	args: { ...base, titles: [legacyClimber, legacyTester] },
};

export const NoRunToArchive: Story = {
	args: { ...base, archivedOn: undefined },
};

export const Settling: Story = {
	args: { ...base, isMutating: true },
};
