import type { Meta, StoryObj } from "@storybook/react";

import { ArchiveInjection } from "./ArchiveInjection.ui";

const meta: Meta<typeof ArchiveInjection> = {
	component: ArchiveInjection,
	title: "Session Run/ArchiveInjection",
};
export default meta;

type Story = StoryObj<typeof ArchiveInjection>;

export const FullInjection: Story = {
	args: { vault: 120, injected: 120 },
};

export const CappedInjection: Story = {
	args: { vault: 640, injected: 200 },
};

export const EmptyVault: Story = {
	args: { vault: 0, injected: 0 },
};
