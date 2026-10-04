import type { Meta, StoryObj } from "@storybook/react";

import { Climber, ClimberStack } from "./Climber.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof Climber> = {
	component: Climber,
	title: "Kanto/Climber",
	args: { name: "Misty" },
	render: (args) => (
		<div className="[--screen-floor:8rem]">
			<Screen theme="lavender">
				<Climber {...args} />
			</Screen>
		</div>
	),
};
export default meta;

type Story = StoryObj<typeof Climber>;

const BORDERS = [
	"/borders/border-js-saffron.svg",
	"/borders/border-ts-lavender.svg",
	"/borders/border-css-cerulean.svg",
	"/borders/border-react-celadon.svg",
	"/borders/border-git-pewter.svg",
	"/borders/border-ruby-cinnabar.svg",
	"/borders/border-html-vermillion.svg",
	"/borders/border-frontend-fuchsia.svg",
];

export const Bare: Story = {};

export const Bordered: Story = {
	args: { borderUrl: BORDERS[0] },
};

export const You: Story = {
	args: { name: "Marciano", you: true },
};

export const Dimmed: Story = {
	args: { name: "Lt. Surge", borderUrl: BORDERS[4], dimmed: true },
};

export const EveryBorder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:10rem]">
			<Screen theme="lavender">
				<div className="flex flex-wrap items-center gap-4">
					{BORDERS.map((borderUrl) => (
						<Climber
							key={borderUrl}
							name={borderUrl.split("-")[1]}
							borderUrl={borderUrl}
							size="md"
						/>
					))}
				</div>
			</Screen>
		</div>
	),
};

export const Stack: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:10rem]">
			<Screen theme="lavender">
				<ClimberStack
					climbers={[
						{ name: "Marciano", you: true },
						{ name: "Brock", borderUrl: BORDERS[1] },
						{ name: "Misty", borderUrl: BORDERS[2] },
						{ name: "Erika" },
					]}
					overflow={1035}
				/>
			</Screen>
		</div>
	),
};
