import type { Meta, StoryObj } from "@storybook/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { Audit } from "./Audit.ui";
import { ConfigChip } from "./ConfigChip.ui";
import { KANTO_COLORS } from "./colors";
import { Redaction } from "./Redaction.ui";
import { Screen } from "./Screen.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const SAMPLE_GATE = 3;

const GRID = "grid grid-cols-[7rem_1fr_1fr] items-center gap-x-6 gap-y-5";
const STACK = "flex flex-col items-start gap-3";
const ENTRY = "flex flex-col items-start gap-0.5";

const WITHHELD = [
	[
		"Audit",
		"Status code, name and cue. Keeps its saffron ground: being a hazard is not the secret, which one it is.",
	],
	[
		"ConfigChip",
		"Name, version, badges and badge colour. The colour names the family, so it goes with the label.",
	],
	[
		"Swatch",
		"The gate's colour. An undiscovered swatch sets no theme attribute at all, or the ground leaks the hue.",
	],
	["Poll", "Not wired yet. Question and answers, once there is a locked poll."],
] as const;

const meta: Meta<typeof Redaction> = {
	component: Redaction,
	title: "Kanto/Redaction",
	args: { label: "Locked audit" },
	render: (args) => (
		<Screen theme="pewter" width="narrow">
			<Typography variant="paragraph">
				<Redaction {...args} />
			</Typography>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Redaction>;

export const Default: Story = {};

export const LockedBesideUnlocked: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<div className={GRID}>
				<span />
				<Typography variant="caption">unlocked</Typography>
				<Typography variant="caption">locked</Typography>

				<Typography variant="caption">Audit</Typography>
				<Audit
					code={507}
					name="Insufficient Storage"
					cue="leaking 16 KB a poll · 32 KB on a miss"
				/>
				<Audit locked />

				<Typography variant="caption">ConfigChip</Typography>
				<ConfigChip
					name="Cache"
					version={4}
					badges={[{ label: "×1.75", color: "viridian" }]}
				/>
				<ConfigChip locked />

				<Typography variant="caption">Swatch</Typography>
				<Swatch state="discovered" swatch={gateSwatchAt(SAMPLE_GATE)} />
				<Swatch state="undiscovered" />
			</div>
		</Screen>
	),
};

export const WhatEachItemWithholds: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<div className={STACK}>
				{WITHHELD.map(([item, withheld]) => (
					<div key={item} className={ENTRY}>
						<Typography variant="title">{item}</Typography>
						<Typography variant="caption">{withheld}</Typography>
					</div>
				))}
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={STACK}>
						<Audit locked />
						<ConfigChip locked />
					</div>
				</Screen>
			))}
		</div>
	),
};
