import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Balance } from "./Balance.ui";
import { Screen } from "./Screen.ui";

const PRESS =
	"rounded-md border border-theme-faint px-3 py-1 text-xs font-bold text-theme";
const CONTROLS = "mt-6 flex flex-wrap gap-2";

const BACK_TO_BACK_MS = 300;

const meta: Meta<typeof Balance> = {
	component: Balance,
	title: "Kanto/Balance",
	args: { label: "Storage balance", kb: 349 },
	render: (args) => (
		<Screen theme="pewter" width="narrow" floor="8rem">
			<Balance {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Balance>;

export const Default: Story = {};

export const InMegabytes: Story = { args: { kb: 1843 } };

export const Inline: Story = { args: { kb: 96, layout: "inline" } };

export const InlinePreviewingAnInstall: Story = {
	args: {
		kb: 410,
		layout: "inline",
		preview: { label: "after install", figure: "378 KB", color: "cinnabar" },
	},
};

export const BandTinted: Story = { args: { kb: 41, color: "saffron" } };

export const PreviewingAnInstall: Story = {
	args: {
		kb: 410,
		preview: { label: "after install", figure: "378 KB", color: "vermillion" },
	},
};

const MovingBalance = () => {
	const [kb, setKb] = useState(349);

	const backToBack = (first: number, second: number) => {
		setKb((held) => held + first);
		setTimeout(() => setKb((held) => held + second), BACK_TO_BACK_MS);
	};

	return (
		<Screen theme="pewter" width="narrow" floor="12rem">
			<Balance label="Storage balance" kb={kb} />
			<div className={CONTROLS}>
				<button className={PRESS} onClick={() => setKb((held) => held + 32)}>
					+32 KB payout
				</button>
				<button className={PRESS} onClick={() => setKb((held) => held + 61)}>
					+61 KB payout
				</button>
				<button className={PRESS} onClick={() => setKb((held) => held - 32)}>
					install · 32 KB
				</button>
				<button className={PRESS} onClick={() => backToBack(-32, -48)}>
					two installs, back to back
				</button>
				<button className={PRESS} onClick={() => backToBack(61, -32)}>
					payout, then install
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

export const Moving: Story = {
	parameters: { controls: { disable: true } },
	render: () => <MovingBalance />,
};
