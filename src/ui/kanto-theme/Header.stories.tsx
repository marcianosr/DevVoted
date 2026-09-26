import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	ALL_SWATCHES,
	GATE_SWATCHES,
} from "~/modules/run/gate/domain/swatch.model";
import { kbLabel } from "~/shared/lib/storage";
import { trackTo } from "~/test/swatchTrack.factory";

import { Header } from "./Header.ui";
import { Screen } from "./Screen.ui";

const PRESS =
	"rounded-md border border-theme-faint px-3 py-1 text-xs font-bold text-theme";

const fundsAt = (kb: number) => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit, label: "storage", kb };
};

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
		funds: { amount: "1.9", unit: "MB", label: "balance", kb: 1946 },
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
		funds: { amount: "1.8", unit: "MB", label: "balance", kb: 1843 },
		ring: { held: 148, demand: 210 },
	},
};

export const WithRingCaptioned: Story = {
	args: {
		funds: { amount: "1.8", unit: "MB", label: "balance", kb: 1843 },
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

/**
 * The readout only moves when the balance does, so the moods it has to carry —
 * counting up green, down red, and the unit roll it refuses to count across —
 * need a press to drive them rather than a fixed arg.
 */
const HeaderWithMovingBalance = () => {
	const [kb, setKb] = useState(349);

	return (
		<Screen theme="pewter" width="narrow">
			<Header
				swatch={GATE_SWATCHES[9]}
				swatches={trackTo(9)}
				funds={fundsAt(kb)}
			/>
			<div className="mt-6 flex flex-wrap gap-2">
				<button className={PRESS} onClick={() => setKb(kb + 32)}>
					+32 KB payout
				</button>
				<button className={PRESS} onClick={() => setKb(kb + 61)}>
					+61 KB payout
				</button>
				<button className={PRESS} onClick={() => setKb(kb - 32)}>
					install · 32 KB
				</button>
				<button className={PRESS} onClick={() => setKb(1046)}>
					roll to MB
				</button>
				<button className={PRESS} onClick={() => setKb(349)}>
					reset to 349
				</button>
			</div>
		</Screen>
	);
};

export const BalanceMoving: Story = {
	parameters: { controls: { disable: true } },
	render: () => <HeaderWithMovingBalance />,
};

export const PreviewingAnInstall: Story = {
	args: {
		funds: {
			...fundsAt(410),
			preview: {
				label: "after install",
				figure: "378 KB",
				color: "vermillion",
			},
		},
	},
};
