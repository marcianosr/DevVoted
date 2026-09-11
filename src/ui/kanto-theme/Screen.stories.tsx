import type { Meta, StoryObj } from "@storybook/react";

import { gateRoster } from "~/test/swatchTrack.factory";

import { KANTO_COLORS, type KantoColor } from "./colors";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const DEFAULT_THEME: KantoColor = "vermillion";

const ThemeDemo = ({ name }: { name: KantoColor }) => (
	<Typography variant="headline">{name}</Typography>
);

const meta: Meta<typeof Screen> = {
	component: Screen,
	title: "Kanto/Screen",
	argTypes: {
		theme: { control: "select", options: KANTO_COLORS },
		width: { control: "inline-radio", options: ["narrow", "default", "wide"] },
	},
	args: { theme: "vermillion" },
	render: ({ theme, gate, ...rest }) => {
		const name = theme ?? DEFAULT_THEME;

		return (
			<Screen theme={name} {...rest}>
				<ThemeDemo name={name} />
			</Screen>
		);
	},
};
export default meta;

type Story = StoryObj<typeof Screen>;

export const Default: Story = {};

export const Narrow: Story = { args: { width: "narrow" } };

export const Wide: Story = { args: { width: "wide" } };

export const Palette: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:16rem]">
			{KANTO_COLORS.map((name) => (
				<Screen key={name} theme={name}>
					<ThemeDemo name={name} />
				</Screen>
			))}
		</div>
	),
};

export const MoodPair: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:16rem]">
			<Screen theme="celadon">
				<ThemeDemo name="celadon" />
			</Screen>
			<Screen theme="cinnabar">
				<ThemeDemo name="cinnabar" />
			</Screen>
		</div>
	),
};

export const EveryGate: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:7rem]">
			{gateRoster.map((swatch) => (
				<Screen key={swatch.id} gate={swatch.theme} width="narrow">
					<Typography variant="headline">
						{`${swatch.gateName} · ${swatch.theme}`}
					</Typography>
				</Screen>
			))}
		</div>
	),
};
