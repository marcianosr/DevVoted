import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.ui";
import { Icon } from "./Icon.ui";
import { Screen } from "./Screen.ui";

const SHEET = "flex flex-wrap items-center gap-8";
const ENTRY = "flex flex-col items-center gap-2 text-xs text-theme-muted";
const ROW = "flex flex-wrap items-center gap-3";

const NAMES = [
	"shop",
	"community",
	"gate",
	"review",
	"chevron",
	"fold",
	"undo",
	"tick",
] as const;

const meta: Meta<typeof Icon> = {
	component: Icon,
	title: "Kanto/Icon",
	argTypes: { name: { control: "select", options: NAMES } },
	args: { name: "shop" },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Icon {...args} className="size-8" />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const Sheet: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={SHEET}>
				{NAMES.map((name) => (
					<span key={name} className={ENTRY}>
						<Icon name={name} className="size-8" />
						{name}
					</span>
				))}
			</div>
		</Screen>
	),
};

export const OnTheButtonsItSigns: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="lavender" width="narrow">
			<div className={ROW}>
				<Button size="md" label="Community" icon="community" />
				<Button size="md" label="Review answers" icon="review" />
				<Button size="md" tone="action" label="To the shop" icon="shop" />
				<Button size="md" tone="action" label="Start Lavender" icon="gate" />
				<Button
					size="md"
					tone="action"
					label="Lavender gate prep"
					icon="chevron"
				/>
			</div>
		</Screen>
	),
};
