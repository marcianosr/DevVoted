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
		storage: { balanceKb: 184 },
		track: { gates: ALL_SWATCHES, cleared: 4 },
		coverage: { held: 12, projected: 4, required: 40 },
	},
};

/** The header carries the run's score, so no fold can put it away. */
export const CoverageOnly: Story = {
	args: {
		title: "Gate 4 · Lavender",
		coverage: { held: 38.6, projected: 23.1, required: 60 },
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
