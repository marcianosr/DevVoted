import type { Meta, StoryObj } from "@storybook/react";

import { Audits, type AuditRow } from "./Audits.ui";

const meta: Meta<typeof Audits> = {
	component: Audits,
	title: "Modern/Audits",
	decorators: [
		(Story) => (
			<div data-gate-theme="volcano" className="max-w-sm p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Audits>;

const AUDITS: readonly AuditRow[] = [
	{ id: "strip", description: "a miss peels 5" },
	{ id: "mirrored", description: "pick every wrong option" },
	{ id: "flaky-build", description: "AGENTS.md missed poll 2" },
];

/** The summit's three, as the poll rail shows them. */
export const Running: Story = { args: { audits: AUDITS, defaultOpen: true } };

export const Shut: Story = { args: { audits: AUDITS } };

/** Volkswagen CI reports the gate's first audit as passing. */
export const Suppressed: Story = {
	args: {
		audits: [{ ...AUDITS[0], suppressed: true }, AUDITS[1], AUDITS[2]],
		defaultOpen: true,
	},
};
