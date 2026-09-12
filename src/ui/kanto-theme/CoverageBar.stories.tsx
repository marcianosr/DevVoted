import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";
import { KANTO_COLORS } from "./colors";
import { CoverageBar } from "./CoverageBar.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const LADDER = "flex flex-col gap-6";
const RUNG = "flex flex-col gap-1";
const ANSWERS = "mt-6 flex gap-2";

const GAIN = 5;
const LOSS = 2.5;
const OPENING = 42;

const VOLCANO = { floor: 55, ok: 65, healthy: 80 };
const PALLET = { floor: 0, ok: 0, healthy: 5 };
const CHAMPION = { floor: 70, ok: 80, healthy: 95 };

const meta: Meta<typeof CoverageBar> = {
	component: CoverageBar,
	title: "Kanto/CoverageBar",
	argTypes: {
		held: { control: { type: "range", min: 0, max: 100, step: 0.1 } },
		floor: { control: { type: "range", min: 0, max: 100 } },
		ok: { control: { type: "range", min: 0, max: 100 } },
		healthy: { control: { type: "range", min: 0, max: 100 } },
		marks: { control: "inline-radio", options: ["boundaries", "bands"] },
	},
	args: {
		...VOLCANO,
		held: 70,
		note: "Coverage starts at zero. Five polls to prove the build again.",
	},
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<CoverageBar {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof CoverageBar>;

export const OnTheOkRung: Story = {};

export const Untouched: Story = {
	args: { held: 0, note: "Nothing proved at this gate yet." },
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

export const Perfect: Story = {
	args: { held: 100, note: "Fully covered, and over the goal." },
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
				{[
					{ held: 40, band: "DANGER" },
					{ held: 58, band: "SHAKY" },
					{ held: 70, band: "OK" },
					{ held: 84, band: "HEALTHY" },
					{ held: 100, band: "PERFECT" },
				].map((rung) => (
					<div key={rung.band} className={RUNG}>
						<Typography variant="label">{rung.band}</Typography>
						<CoverageBar {...VOLCANO} held={rung.held} pin />
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
				{[
					{ held: 40, band: "DANGER" },
					{ held: 58, band: "SHAKY" },
					{ held: 70, band: "OK" },
					{ held: 84, band: "HEALTHY" },
					{ held: 100, band: "PERFECT" },
				].map((rung) => (
					<div key={rung.band} className={RUNG}>
						<Typography variant="label">{rung.band}</Typography>
						<CoverageBar {...VOLCANO} held={rung.held} />
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
				note="Answer a poll and the pin rides the fill to the new figure."
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
