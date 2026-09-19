import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import { trackTo } from "~/test/swatchTrack.factory";

import { Header } from "./Header.ui";
import { Screen } from "./Screen.ui";

const VICTORY_GATE = 12;

const meta: Meta<typeof Header> = {
	component: Header,
	title: "Kanto/Header",
	args: {
		swatch: GATE_SWATCHES[9],
		swatches: trackTo(9),
	},
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<Header {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const FirstGate: Story = {
	args: { swatch: GATE_SWATCHES[0], swatches: trackTo(0) },
};

export const WithCoverage: Story = {
	args: {
		note: "2 of 5 answered",
		noteAt: "track",
		badge: "3 audits",
		funds: { amount: "1.9", unit: "MB", label: "balance" },
		coverage: {
			label: "coverage",
			held: "92.5",
			demand: "375%",
			meter: { value: 92.5, max: 375 },
		},
	},
};

export const WithRing: Story = {
	args: {
		funds: { amount: "1.8", unit: "MB", label: "balance" },
		ring: { held: 148, demand: 210 },
	},
};

export const WithRingCaptioned: Story = {
	args: {
		funds: { amount: "1.8", unit: "MB", label: "balance" },
		ring: {
			held: 148,
			demand: 210,
			title: "Coverage toward Volcano",
			note: "Pick an answer to see where it puts you.",
		},
	},
};

export const ElitePlate: Story = {
	args: { swatch: GATE_SWATCHES[11], swatches: trackTo(11) },
};

export const ChampionPrismatic: Story = {
	args: { swatch: GATE_SWATCHES[12], swatches: trackTo(12) },
};

export const EveryGate: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:11rem]">
			{ALL_SWATCHES.map((swatch) => (
				<Screen key={swatch.id} theme="pewter" width="narrow">
					<Header swatch={swatch} swatches={trackTo(swatch.gate)} />
				</Screen>
			))}
		</div>
	),
};
