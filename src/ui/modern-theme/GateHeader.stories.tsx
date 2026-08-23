import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

import { GateHeader } from "./GateHeader.ui";

const meta: Meta<typeof GateHeader> = {
	component: GateHeader,
	title: "Modern/GateHeader",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateHeader>;

export const MidRun: Story = {
	args: {
		title: "Gate 4 · Lavender",
		audits: ["dependency-outage"],
		storage: { plan: "Free tier", used: 184, cap: 512 },
		track: { gates: ALL_SWATCHES, cleared: 4 },
	},
};

export const NoAudit: Story = {
	args: {
		title: "Gate 4 · Lavender",
		track: { gates: ALL_SWATCHES, cleared: 4 },
	},
};

export const FirstGate: Story = {
	args: {
		title: "Gate 0 · Pallet",
		track: { gates: ALL_SWATCHES, cleared: 0 },
	},
};

export const TitleOnly: Story = { args: { title: "Gate 4 · Lavender" } };
