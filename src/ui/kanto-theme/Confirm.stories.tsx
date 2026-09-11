import type { Meta, StoryObj } from "@storybook/react";

import { planChangeFor, uninstallFor } from "~/test/kantoPoll.factory";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { Confirm } from "./Confirm.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Uninstall } from "./Uninstall.ui";
import { Weight } from "./Weight.ui";

const noop = () => {};

const PLAN = planChangeFor(3, 2, 1536);

const meta: Meta<typeof Confirm> = {
	component: Confirm,
	title: "Kanto/Confirm",
	args: {
		eyebrow: "downgrade",
		title: "Storage plan 1 MB",
		prose: PLAN.prose,
		figures: PLAN.figures,
		confirmLabel: "drop to 1 MB",
		onConfirm: noop,
		onCancel: noop,
	},
	render: (args) => (
		<Screen theme="cinnabar" width="narrow">
			<Panel>
				<Confirm {...args} />
			</Panel>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Confirm>;

export const Spend: Story = {};

export const WithALead: Story = {
	args: {
		eyebrow: "uninstall",
		title: "Intellisense",
		confirmLabel: "uninstall",
		lead: <Weight slots={8} />,
	},
};

export const BothCallers: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cinnabar" width="narrow">
			<Panel>
				<Confirm
					eyebrow="downgrade"
					title="Storage plan 1 MB"
					prose={PLAN.prose}
					figures={PLAN.figures}
					confirmLabel="drop to 1 MB"
					onConfirm={noop}
					onCancel={noop}
				/>
			</Panel>
			<Panel>
				<Uninstall
					{...uninstallFor(CONFIGS.mooresLaw)}
					onConfirm={noop}
					onCancel={noop}
				/>
			</Panel>
		</Screen>
	),
};
