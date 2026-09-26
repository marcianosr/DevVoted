import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { uninstallFor } from "~/test/kantoPoll.factory";

import { Modal } from "./Modal.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";
import { Uninstall } from "./Uninstall.ui";

const noop = () => {};

const MOORES_LAW = uninstallFor(CONFIGS.mooresLaw);

const meta: Meta<typeof Modal> = {
	component: Modal,
	title: "Kanto/Modal",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const UninstallConfig: Story = {
	render: () => (
		<Screen theme="lavender">
			<Typography variant="headline">Shop</Typography>
			<Typography variant="paragraph">
				The page behind the dialog, to show the scrim doing its job.
			</Typography>
			<Modal label={`Uninstall ${MOORES_LAW.name}`} onDismiss={noop}>
				<Uninstall {...MOORES_LAW} onConfirm={noop} onCancel={noop} />
			</Modal>
		</Screen>
	),
};

export const PlainBody: Story = {
	render: () => (
		<Screen theme="cerulean">
			<Modal label="A plain dialog" onDismiss={noop}>
				<Typography variant="title">A plain dialog</Typography>
				<Typography variant="caption" as="p">
					Modal owns the scrim, the panel and the dismiss control, and nothing
					else.
				</Typography>
			</Modal>
		</Screen>
	),
};
