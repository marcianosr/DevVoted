import type { Meta, StoryObj } from "@storybook/react";

import { Author } from "./Author.ui";
import { CategoryLeader } from "./CategoryLeader.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const PORTRAIT = "/editors/sabrina.png";
const BORDER = "/borders/border-js-saffron.svg";
const CATEGORY = "JavaScript";
const REGION = "border-t border-theme-faint px-4 py-3";

const meta: Meta<typeof CategoryLeader> = {
	component: CategoryLeader,
	title: "Kanto/CategoryLeader",
	args: {
		category: CATEGORY,
		leader: {
			handle: "@sabrina",
			githubLogin: "sabrina",
			figure: "17 in a row",
			photoUrl: PORTRAIT,
		},
	},
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Panel>
				<div className={REGION}>
					<CategoryLeader {...args} />
				</div>
			</Panel>
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof CategoryLeader>;

export const Default: Story = {};

export const SeatOpen: Story = {
	args: { leader: undefined, claim: "3 in a row claims it" },
};

export const YouHoldIt: Story = {
	args: {
		leader: {
			handle: "@marcianoschildmeijer",
			githubLogin: "marcianoschildmeijer",
			figure: "17 in a row",
			photoUrl: PORTRAIT,
			you: true,
		},
	},
};

export const NoPhotoYet: Story = {
	args: {
		leader: {
			handle: "@giovanni",
			githubLogin: "giovanni",
			figure: "9 in a row",
		},
	},
};

export const NoGithubToLinkTo: Story = {
	args: { leader: { handle: "Professor Oak", figure: "9 in a row" } },
};

export const EquippedBorder: Story = {
	args: {
		leader: {
			handle: "@sabrina",
			githubLogin: "sabrina",
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
				<Panel.Header label="poll 2 of 5" badge={{ label: CATEGORY }} />
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
				<div className={REGION}>
					<CategoryLeader {...args} />
				</div>
			</Panel>
		</Screen>
	),
};

const BOARD = [
	{ category: "JavaScript", handle: "@koga", figure: "21 in a row" },
	{ category: "CSS", handle: "@erika", figure: "18 in a row" },
	{ category: "Git", handle: "@giovanni", figure: "13 in a row" },
];

export const OnTheBoard: Story = {
	render: () => (
		<Screen theme="viridian" width="narrow">
			<Panel>
				<Panel.Header
					label="Category leaders"
					meta="longest run of correct answers · all-time"
				/>
				<Panel.Rows>
					{BOARD.map(({ category, handle, figure }) => (
						<Panel.Row key={category}>
							<CategoryLeader
								category={category}
								leader={{ handle, githubLogin: handle.slice(1), figure }}
							/>
						</Panel.Row>
					))}
					<Panel.Row>
						<CategoryLeader category="Vue" claim="3 in a row claims it" />
					</Panel.Row>
				</Panel.Rows>
				<Panel.Footer>
					<Typography variant="hint" as="span">
						A seat changes hands when somebody beats it.
					</Typography>
				</Panel.Footer>
			</Panel>
		</Screen>
	),
};
