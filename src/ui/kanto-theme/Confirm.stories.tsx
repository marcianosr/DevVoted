import type { Meta, StoryObj } from "@storybook/react";

import { uninstallFor } from "~/test/kantoPoll.factory";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

import { Confirm } from "./Confirm.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Uninstall } from "./Uninstall.ui";
import { Weight } from "./Weight.ui";

const noop = () => {};

const SPACE = {
	prose:
		"Stepping down to 8 weight saves 32 KB a gate, but the build has to fit it before the shop lets you leave.",
	figures: [
		{ label: "a gate", value: "−32 KB", color: "viridian" as const },
		{ label: "room", value: "8 weight" },
	],
};

const meta: Meta<typeof Confirm> = {
	component: Confirm,
	title: "Kanto/Confirm",
	args: {
		eyebrow: "downgrade",
		title: "Build space 8 weight",
		prose: SPACE.prose,
		figures: SPACE.figures,
		confirmLabel: "drop to 8 weight",
		onConfirm: noop,
		onCancel: noop,
	},
	render: (args) => (
		<Screen theme="cinnabar" width="narrow">
			<Panel>
				<Panel.Body>
					<Confirm {...args} />
				</Panel.Body>
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
				<Panel.Body>
					<Confirm
						eyebrow="downgrade"
						title="Build space 8 weight"
						prose={SPACE.prose}
						figures={SPACE.figures}
						confirmLabel="drop to 8 weight"
						onConfirm={noop}
						onCancel={noop}
					/>
				</Panel.Body>
			</Panel>
			<Panel>
				<Panel.Body>
					<Uninstall
						{...uninstallFor(CONFIGS.mooresLaw)}
						onConfirm={noop}
						onCancel={noop}
					/>
				</Panel.Body>
			</Panel>
		</Screen>
	),
};
