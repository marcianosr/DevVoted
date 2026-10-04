import type { Meta, StoryObj } from "@storybook/react";

import { Author } from "./Author.ui";
import { Panel } from "./Panel.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const BORDER = "/borders/border-grass.png";
const PORTRAIT = "/editors/brock.png";

const meta: Meta<typeof Author> = {
	component: Author,
	title: "Kanto/Author",
	args: {
		handle: "matthijsgroen",
		role: "Poll editor",
		title: "Git Maintainer",
		photoUrl: PORTRAIT,
		borderUrl: BORDER,
	},
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Author {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Author>;

export const Default: Story = {};

export const NoBorderEquipped: Story = { args: { borderUrl: undefined } };

export const NoTitle: Story = { args: { title: undefined } };

export const NoRole: Story = { args: { role: undefined } };

export const PlainPlayer: Story = {
	args: { role: undefined, title: undefined },
};

export const AvatarFallback: Story = { args: { photoUrl: undefined } };

export const LongTitle: Story = {
	args: { title: "General Frontend Maintainer" },
};

export const InAPanelFooter: Story = {
	args: { size: "sm", rule: false },
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
					<Author {...args} />
				</Panel.Footer>
			</Panel>
		</Screen>
	),
};
