import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";
import { KANTO_COLORS } from "./colors";
import { bandAtLadder } from "~/modules/run/gate/domain/gate.model";

import {
	COVERAGE_BAND_WORD,
	CoverageBar,
	type CoverageBandId,
} from "./CoverageBar.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const LADDER = "flex flex-col gap-6";
const RUNG = "flex flex-col gap-1";
const ANSWERS = "mt-6 flex gap-2";

const GAIN = 5;
const LOSS = 2.5;
const OPENING = 42;

const VOLCANO = { floor: 55, ok: 65, healthy: 80 };
const PALLET = { floor: 0, ok: 40, healthy: 60 };
const CHAMPION = { floor: 70, ok: 80, healthy: 95 };

const VOLCANO_RUNGS: readonly { held: number; band: CoverageBandId }[] = [
	{ held: 40, band: "danger" },
	{ held: 58, band: "shaky" },
	{ held: 70, band: "ok" },
	{ held: 84, band: "healthy" },
	{ held: 100, band: "perfect" },
];

const meta: Meta<typeof CoverageBar> = {
	component: CoverageBar,
	title: "Kanto/CoverageBar",
	argTypes: {
		held: { control: { type: "range", min: 0, max: 100, step: 0.1 } },
		floor: { control: { type: "range", min: 0, max: 100 } },
		ok: { control: { type: "range", min: 0, max: 100 } },
		healthy: { control: { type: "range", min: 0, max: 100 } },
		marks: { control: "inline-radio", options: ["boundaries", "bands"] },
		ghostAt: { control: { type: "range", min: 0, max: 100, step: 0.1 } },
	},
	args: {
		...VOLCANO,
		held: 70,
		band: "ok",
		note: "Coverage starts at zero. Five polls to prove the build again.",
	},
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<CoverageBar {...args} band={bandAtLadder(args.held, args).id} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof CoverageBar>;

export const OnTheOkRung: Story = {};

export const Empty: Story = {
	args: { held: 0, note: "Nothing proved at this gate yet." },
};

export const MidBand: Story = {
	args: { held: 60, note: "Halfway up the shaky band." },
};

export const Full: Story = {
	args: { held: 100, note: "Every band lit." },
};

export const WithGhost: Story = {
	args: {
		held: 84,
		ghostAt: 52,
		note: "The dashed line is where the bar stood before.",
	},
};

const Settling = () => {
	const [settles, setSettles] = useState(0);

	return (
		<Screen theme="vermillion" width="narrow">
			<CoverageBar
				{...VOLCANO}
				held={72}
				band="ok"
				settleKey={`${settles}`}
				note="Press settle to replay the bounce."
			/>
			<div className={ANSWERS}>
				<Button
					label="Settle"
					onPress={() => setSettles((count) => count + 1)}
				/>
			</div>
		</Screen>
	);
};

export const Settle: Story = {
	parameters: { controls: { disable: true } },
	render: () => <Settling />,
};

export const Danger: Story = {
	args: { held: 40, note: "Under the floor: this gate closes on you." },
};

export const Shaky: Story = {
	args: { held: 58, note: "Above the floor, so the run survives." },
};

export const Healthy: Story = {
	args: { held: 84, note: "The gate's line is met." },
};

export const Landed: Story = {
	args: {
		held: 72.4,
		pin: true,
		note: "The gate is closed: the pin is where the meter stopped.",
	},
};

export const LandedShort: Story = {
	args: {
		held: 58,
		pin: true,
		note: "Above the floor, under the line. The gate holds.",
	},
};

export const PinnedLadder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={LADDER}>
				{VOLCANO_RUNGS.map((rung) => (
					<div key={rung.band} className={RUNG}>
						<Typography variant="label">
							{COVERAGE_BAND_WORD[rung.band]}
						</Typography>
						<CoverageBar {...VOLCANO} held={rung.held} band={rung.band} pin />
					</div>
				))}
			</div>
		</Screen>
	),
};

export const BandLadder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={LADDER}>
				{VOLCANO_RUNGS.map((rung) => (
					<div key={rung.band} className={RUNG}>
						<Typography variant="label">
							{COVERAGE_BAND_WORD[rung.band]}
						</Typography>
						<CoverageBar {...VOLCANO} held={rung.held} band={rung.band} />
					</div>
				))}
			</div>
		</Screen>
	),
};

export const EarlyGate: Story = {
	args: {
		...PALLET,
		held: 12.5,
		note: "Pallet has no floor, so nothing answered can close it.",
	},
};

export const Champion: Story = {
	args: {
		...CHAMPION,
		held: 88,
		note: "The last gate leaves five points of headroom.",
	},
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<CoverageBar
						{...VOLCANO}
						held={70}
						band="ok"
						note={`The bands hold their own colours on ${theme}`}
					/>
				</Screen>
			))}
		</div>
	),
};

const Answering = () => {
	const [held, setHeld] = useState(OPENING);
	const move = (by: number) =>
		setHeld((at) => Math.min(100, Math.max(0, at + by)));

	return (
		<Screen theme="vermillion" width="narrow">
			<CoverageBar
				{...VOLCANO}
				held={held}
				band={bandAtLadder(held, VOLCANO).id}
				note="Answer a poll and the marker rides the lit edge to the new figure."
			/>
			<div className={ANSWERS}>
				<Button label="Correct" tone="action" onPress={() => move(GAIN)} />
				<Button label="Miss" tone="danger" onPress={() => move(-LOSS)} />
			</div>
		</Screen>
	);
};

export const AnswerLands: Story = {
	parameters: { controls: { disable: true } },
	render: () => <Answering />,
};
