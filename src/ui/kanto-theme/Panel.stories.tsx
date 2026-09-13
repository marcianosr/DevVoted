import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const meta: Meta<typeof Panel> = {
	component: Panel,
	title: "Kanto/Panel",
	parameters: { controls: { disable: true } },
};
export default meta;

type Story = StoryObj<typeof Panel>;

const Body = () => (
	<>
		<Typography variant="subtitle">Storage plan</Typography>
		<Typography variant="hint">
			Caps what you can hold. A clear that pays over the cap burns the rest.
		</Typography>
	</>
);

export const OnAScreen: Story = {
	render: () => (
		<Screen theme="cinnabar">
			<Panel>
				<Body />
			</Panel>
		</Screen>
	),
};

export const InAFixedColumn: Story = {
	render: () => (
		<Screen theme="cerulean">
			<Panel className="w-80">
				<Body />
			</Panel>
		</Screen>
	),
};

export const SideBySide: Story = {
	render: () => (
		<Screen theme="viridian">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<Panel>
					<Body />
				</Panel>
				<Panel>
					<Typography variant="subtitle">git tag</Typography>
					<Typography variant="hint">
						A checkpoint. If this run dies, your next one starts here instead of
						starting over.
					</Typography>
				</Panel>
			</div>
		</Screen>
	),
};
