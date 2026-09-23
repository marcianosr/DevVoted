import type { Meta, StoryObj } from "@storybook/react";

import { Author } from "./Author.ui";
import { HallOfFame } from "./HallOfFame.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const PORTRAIT = "/editors/sabrina.png";
const BORDER = "/borders/border-js-saffron.svg";
const CAPTION = "the longest run of correct JavaScript answers";

const meta: Meta<typeof HallOfFame> = {
	component: HallOfFame,
	title: "Kanto/HallOfFame",
	args: {
		caption: CAPTION,
		holder: {
			handle: "@sabrina",
			githubLogin: "sabrina",
			title: "JavaScript Maintainer",
			figure: "17 in a row",
			photoUrl: PORTRAIT,
		},
		yourBest: "your best 4",
	},
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Panel>
				<HallOfFame {...args} />
			</Panel>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof HallOfFame>;

export const Default: Story = {};

export const Unclaimed: Story = {
	args: { holder: undefined, yourBest: "your best 2" },
};

export const YouHoldIt: Story = {
	args: {
		holder: {
			handle: "@marcianoschildmeijer",
			githubLogin: "marcianoschildmeijer",
			title: "JavaScript Maintainer",
			figure: "17 in a row",
			photoUrl: PORTRAIT,
			you: true,
		},
		yourBest: undefined,
	},
};

export const NeverAnsweredTheCategory: Story = {
	args: { yourBest: undefined },
};

export const NoPhotoYet: Story = {
	args: {
		holder: {
			handle: "@giovanni",
			githubLogin: "giovanni",
			title: "JavaScript Maintainer",
			figure: "9 in a row",
		},
	},
};

export const NoGithubToLinkTo: Story = {
	args: {
		holder: {
			handle: "Professor Oak",
			title: "JavaScript Maintainer",
			figure: "9 in a row",
		},
	},
};

export const EquippedBorder: Story = {
	args: {
		holder: {
			handle: "@sabrina",
			githubLogin: "sabrina",
			title: "JavaScript Maintainer",
			figure: "17 in a row",
			photoUrl: PORTRAIT,
			borderUrl: BORDER,
		},
	},
};

export const UnderTheByline: Story = {
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Panel>
				<Panel.Header label="poll 2 of 5" badge={{ label: "JavaScript" }} />
				<Panel.Body>
					<Typography variant="title">
						Which method returns the last element of an array?
					</Typography>
				</Panel.Body>
				<Panel.Footer
					trailing={
						<Typography variant="hint" as="span">
							press A, B or C to lock in
						</Typography>
					}
				>
					<Author
						handle="matthijsgroen"
						title="Poll editor"
						photoUrl="/editors/brock.png"
						size="sm"
						rule={false}
					/>
				</Panel.Footer>
				<HallOfFame {...args} />
			</Panel>
		</Screen>
	),
};
