import type { Meta, StoryObj } from "@storybook/react";

import { trackTo } from "~/test/swatchTrack.factory";

import { KANTO_COLORS, type KantoColor } from "./colors";
import { Screen } from "./Screen.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

const DISCOVERED = 9;

const meta: Meta<typeof SwatchTrack> = {
	component: SwatchTrack,
	title: "Kanto/SwatchTrack",
	argTypes: { size: { control: "inline-radio", options: ["small", "large"] } },
	args: { swatches: trackTo(DISCOVERED), size: "large" },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<SwatchTrack {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof SwatchTrack>;

export const Default: Story = {};

export const Small: Story = { args: { size: "small" } };

export const Untouched: Story = { args: { swatches: trackTo(0) } };

export const Complete: Story = {
	args: { swatches: trackTo(KANTO_COLORS.length) },
};

export const Progression: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			{[0, 4, DISCOVERED, KANTO_COLORS.length].map((discovered) => (
				<div key={discovered} className="flex flex-col gap-2">
					<Typography variant="title">{discovered} discovered</Typography>
					<SwatchTrack swatches={trackTo(discovered)} size="small" />
				</div>
			))}
		</Screen>
	),
};

const ThemeRow = ({ theme }: { theme: KantoColor }) => (
	<Screen theme={theme} width="narrow">
		<Typography variant="title">{theme}</Typography>
		<SwatchTrack swatches={trackTo(DISCOVERED)} />
	</Screen>
);

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:12rem]">
			{KANTO_COLORS.map((name) => (
				<ThemeRow key={name} theme={name} />
			))}
		</div>
	),
};
