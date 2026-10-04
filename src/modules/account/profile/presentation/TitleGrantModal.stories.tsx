import type { Meta, StoryObj } from "@storybook/react";

import {
	TitleGrantModal,
	type TitleGrantModalProps,
} from "~/modules/account/profile/presentation/TitleGrantModal.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";

const noop = () => {};

const legacyTester = {
	id: "title-legacy-tester",
	name: "Legacy Tester",
	worn: false,
};

const legacyClimber = {
	id: "title-legacy-active",
	name: "Legacy Climber",
	worn: true,
};

const base: TitleGrantModalProps = {
	titles: [legacyTester],
	archiveBonus: "256 KB",
	wears: 1,
	onWear: noop,
	onDismiss: noop,
};

const meta: Meta<typeof TitleGrantModal> = {
	component: TitleGrantModal,
	title: "Account/TitleGrantModal",
	render: (args) => (
		<Screen theme="viridian">
			<TitleGrantModal {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof TitleGrantModal>;

export const PlayedTheOldGame: Story = { args: base };

export const CaughtMidClimb: Story = {
	args: {
		...base,
		titles: [legacyClimber, legacyTester],
		archiveBonus: "1 MB",
		archivedOn: "14 Aug 2026",
	},
};

export const NeverPaid: Story = {
	args: { ...base, archiveBonus: undefined },
};

export const TwoToWear: Story = {
	args: {
		...base,
		titles: [{ ...legacyClimber, worn: false }, legacyTester],
		archiveBonus: "1 MB",
		wears: 2,
	},
};

export const AlreadyWearingIt: Story = {
	args: { ...base, titles: [{ ...legacyTester, worn: true }], wears: 0 },
};

export const AtTheCap: Story = {
	args: {
		...base,
		wears: 0,
		note: "You already wear 3 titles. Take one off on your profile first.",
	},
};

export const Settling: Story = {
	args: { ...base, isMutating: true },
};
