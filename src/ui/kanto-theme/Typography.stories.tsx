import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS, type KantoColor } from "./colors";
import { Screen } from "./Screen.ui";
import { Typography, type TypographyVariant } from "./Typography.ui";

const VARIANTS = [
	"headline",
	"title",
	"subtitle",
	"paragraph",
	"caption",
	"label",
	"hint",
	"accent",
] satisfies TypographyVariant[];

const HINT = "tap any config to open it · press A, B or C to answer";

const meta: Meta<typeof Typography> = {
	component: Typography,
	title: "Kanto/Typography",
	argTypes: {
		variant: { control: "inline-radio", options: VARIANTS },
		as: { control: "inline-radio", options: ["h1", "h2", "h3", "p", "span"] },
	},
	args: { variant: "headline", children: "Kanto region" },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<Typography {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Typography>;

export const Default: Story = {};

const Ramp = ({ theme }: { theme: KantoColor }) => (
	<Screen theme={theme} width="narrow">
		<Typography variant="headline">
			Which utility type makes every property optional?
		</Typography>
		<Typography variant="title">Route 1 · {theme}</Typography>
		<Typography variant="subtitle">Rebuild the registry</Typography>
		<Typography variant="paragraph">
			A trainer leaves Pallet Town with a single partner and no map, which is
			the whole of the tutorial.
		</Typography>
		<Typography variant="caption" as="p">
			Ten steps of tall grass to the next town, and the grass is where the
			explaining gets done.
		</Typography>
		<Typography variant="label">installed</Typography>
		<Typography variant="accent">balance</Typography>
		<Typography variant="hint">{HINT}</Typography>
	</Screen>
);

export const Scale: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:26rem]">
			<Ramp theme="vermillion" />
		</div>
	),
};

export const StyleApartFromTag: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cerulean">
			{VARIANTS.map((variant) => (
				<div key={variant} className="flex flex-col gap-1">
					<Typography variant="hint">{variant}</Typography>
					<Typography variant={variant}>The Kanto region</Typography>
					<Typography variant={variant} as="p">
						The Kanto region, forced onto a paragraph
					</Typography>
				</div>
			))}
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:26rem]">
			{KANTO_COLORS.map((name) => (
				<Ramp key={name} theme={name} />
			))}
		</div>
	),
};

export const Hint: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion">
			<Typography variant="hint">{HINT}</Typography>
		</Screen>
	),
};

export const Accent: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<Typography variant="accent">balance</Typography>
		</Screen>
	),
};

export const ProseAgainstTheReadingLine: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:20rem]">
			{KANTO_COLORS.map((name) => (
				<Screen key={name} theme={name} width="narrow">
					<Typography variant="paragraph">
						An answer row, at the size and the near-white the reading line
						wants.
					</Typography>
					<Typography variant="caption" as="p">
						A modal explaining itself, a step smaller and wearing the hue of the
						screen it sits on.
					</Typography>
				</Screen>
			))}
		</div>
	),
};

export const QuietestToLoudest: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:12rem]">
			{KANTO_COLORS.map((name) => (
				<Screen key={name} theme={name} width="narrow">
					<Typography variant="hint">{HINT}</Typography>
					<Typography variant="caption">{name}</Typography>
					<Typography variant="accent">balance</Typography>
				</Screen>
			))}
		</div>
	),
};
