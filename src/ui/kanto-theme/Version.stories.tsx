import type { Meta, StoryObj } from "@storybook/react";

import { KANTO_COLORS } from "./colors";
import { Screen } from "./Screen.ui";
import { Version } from "./Version.ui";

const LADDER = "flex flex-col items-start gap-2";
const ROW = "flex items-center gap-3";

const meta: Meta<typeof Version> = {
	component: Version,
	title: "Kanto/Version",
	argTypes: {
		version: { control: { type: "range", min: 1, max: 5 } },
		state: {
			control: "inline-radio",
			options: ["owned", "offered", "unaffordable", "future"],
		},
	},
	args: { version: 2, state: "owned" },
	render: (args) => (
		<Screen theme="vermillion" width="narrow">
			<Version {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Version>;

export const Owned: Story = {};

export const Offered: Story = { args: { version: 3, state: "offered" } };

export const Unaffordable: Story = {
	args: { version: 3, state: "unaffordable" },
};

export const Future: Story = { args: { version: 5, state: "future" } };

export const Ladder: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="vermillion" width="narrow">
			<div className={LADDER}>
				<Version version={1} state="owned" />
				<Version version={2} state="owned" />
				<Version version={3} state="offered" />
				<Version version={4} state="future" />
				<Version version={5} state="future" />
			</div>
		</Screen>
	),
};

export const AcrossThemes: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:6rem]">
			{KANTO_COLORS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<div className={ROW}>
						<Version version={2} state="owned" />
						<Version version={3} state="offered" />
						<Version version={3} state="unaffordable" />
						<Version version={4} state="future" />
					</div>
				</Screen>
			))}
		</div>
	),
};
