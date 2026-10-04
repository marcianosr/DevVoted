import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import { trackTo } from "~/test/swatchTrack.factory";

import { Header } from "./Header.ui";
import { Screen } from "./Screen.ui";

const fundsAt = (kb: number) => ({ label: "storage", kb });

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
		badges: [{ label: "3 audits" }],
		funds: fundsAt(1946),
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
		funds: fundsAt(1843),
		ring: { held: 148, demand: 210 },
	},
};

export const WithRingCaptioned: Story = {
	args: {
		funds: fundsAt(1843),
		ring: {
			held: 148,
			demand: 210,
			title: "Coverage toward Cinnabar",
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

const SHELF = "flex flex-col gap-4";
const OFFER =
	"rounded-2xl border border-theme-faint bg-theme-faint px-4 py-8 text-sm text-theme-muted";

const shelf = Array.from({ length: 12 }, (_, row) => `Offer ${row + 1}`);

export const Pinned: Story = {
	args: {
		funds: fundsAt(96),
		title: "Registry",
		subtitle: "Improve your build this run!",
		note: "gate 2 cleared",
	},
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<Header {...args} pinned />
			<div className={SHELF}>
				{shelf.map((offer) => (
					<div key={offer} className={OFFER}>
						{offer}
					</div>
				))}
			</div>
		</Screen>
	),
};
