import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge.ui";
import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";

const noop = () => {};

const ROW = "flex flex-wrap items-center gap-3";

const meta: Meta<typeof Badge> = {
	component: Badge,
	title: "Kanto/Badge",
	argTypes: {
		color: { control: "select", options: KANTO_COLORS },
	},
	args: { children: "×2 fading" },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Badge {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const FollowingTheScreen: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:8rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<Badge>follows the screen</Badge>
				</Screen>
			))}
		</div>
	),
};

export const EveryColour: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="pewter">
			<div className={ROW}>
				{KANTO_COLORS.map((color) => (
					<Badge key={color} color={color}>
						{color}
					</Badge>
				))}
			</div>
		</Screen>
	),
};

export const Pressable: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<Badge onPress={noop} hint="ESLint · cross out a wrong answer · 32 KB">
				lint 32 KB
			</Badge>
		</Screen>
	),
};

export const Armed: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<Badge onPress={noop} armed hint="A/B Test · switch to arm B">
				arm A
			</Badge>
		</Screen>
	),
};

export const Unaffordable: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<Badge onPress={noop} disabled hint="peek · 512 KB · not enough storage">
				peek 512 KB
			</Badge>
		</Screen>
	),
};

export const PressableBesideDecoration: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cerulean" width="narrow">
			<div className={ROW}>
				<Badge color="cerulean">decoration</Badge>
				<Badge onPress={noop}>idle press</Badge>
				<Badge onPress={noop} armed>
					armed press
				</Badge>
				<Badge onPress={noop} disabled>
					disabled press
				</Badge>
			</div>
		</Screen>
	),
};

export const PressAcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:8rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={ROW}>
						<Badge color="viridian">×1.25</Badge>
						<Badge onPress={noop}>lint 32 KB</Badge>
						<Badge onPress={noop} armed>
							arm A
						</Badge>
					</div>
				</Screen>
			))}
		</div>
	),
};
