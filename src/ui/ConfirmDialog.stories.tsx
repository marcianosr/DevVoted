import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog } from "./ConfirmDialog.component";

const meta: Meta<typeof ConfirmDialog> = {
	component: ConfirmDialog,
	title: "UI/ConfirmDialog",
};
export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
	args: {
		isOpen: true,
		title: "Uninstall config?",
		message: "This will remove the config and free up storage.",
		confirmText: "Uninstall",
		cancelText: "Keep it",
		onConfirm: () => {},
		onCancel: () => {},
	},
};

export const WithError: Story = {
	args: {
		isOpen: true,
		title: "Delete run?",
		message: "This action cannot be undone.",
		errorMessage: "Failed to delete. Please try again.",
		onConfirm: () => {},
		onCancel: () => {},
	},
};

export const CinnabarWarning: Story = {
	args: {
		isOpen: true,
		theme: "cinnabar",
		title: "Abandon this run?",
		message:
			"The climb ends here and every KB of leftover storage is forfeited.",
		confirmText: "Abandon run",
		cancelText: "Keep climbing",
		onConfirm: () => {},
		onCancel: () => {},
	},
};

export const Confirming: Story = {
	args: {
		isOpen: true,
		title: "Start new run?",
		message: "Your current run will end.",
		isConfirming: true,
		onConfirm: () => {},
		onCancel: () => {},
	},
};
