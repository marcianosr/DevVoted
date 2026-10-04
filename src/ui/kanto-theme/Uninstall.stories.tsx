import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { uninstallFor } from "~/test/kantoPoll.factory";

import { Screen } from "./Screen.ui";
import { Uninstall } from "./Uninstall.ui";

const noop = () => {};

const MOORES_LAW = uninstallFor(CONFIGS.mooresLaw);

const meta: Meta<typeof Uninstall> = {
	component: Uninstall,
	title: "Kanto/Uninstall",
	args: { ...MOORES_LAW, onConfirm: noop, onCancel: noop },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<Uninstall {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Uninstall>;

export const MooresLaw: Story = {};

export const EightSlots: Story = {
	args: {
		...uninstallFor(CONFIGS.intellisense),
		onConfirm: noop,
		onCancel: noop,
	},
};
