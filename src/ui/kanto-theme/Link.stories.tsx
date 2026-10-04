import type { Meta, StoryObj } from "@storybook/react";

import type { KantoColor } from "./colors";
import { Link } from "./Link.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const HANDLE = "@matthijsgroen";
const GITHUB = "https://github.com/matthijsgroen";

const SCREENS = [
	"cinnabar",
	"cerulean",
	"viridian",
	"saffron",
] as const satisfies readonly KantoColor[];

const meta = {
	title: "Kanto/Link",
	component: Link,
	args: { href: GITHUB, children: HANDLE, external: true },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const External: Story = {};

export const InApp: Story = {
	args: { href: "/dex", children: "the Dex", external: false },
};

export const InQuietProse: Story = {
	render: (args) => (
		<Screen theme="cinnabar" width="narrow">
			<Typography variant="caption" as="span">
				<span className="opacity-60">Created by </span>
				<Link {...args} />
				<span className="opacity-60"> · Poll editor</span>
			</Typography>
		</Screen>
	),
};

export const AcrossScreens: Story = {
	render: (args) => (
		<div className="flex flex-col gap-4">
			{SCREENS.map((theme) => (
				<Screen key={theme} theme={theme} width="narrow">
					<Typography variant="caption" as="span">
						<span className="opacity-60">Created by </span>
						<Link {...args} />
						<span className="opacity-60"> · Poll editor</span>
					</Typography>
				</Screen>
			))}
		</div>
	),
};
