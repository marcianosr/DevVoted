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
			userId: "sabrina",
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

export const CountedAsCorrect: Story = {
	args: {
		leader: {
			handle: "@brock",
			userId: "brock",
			figure: "58 correct",
			photoUrl: PORTRAIT,
		},
	},
};

export const CorrectSeatOpen: Story = {
	args: { leader: undefined, claim: "4 correct claims it" },
};

export const YouHoldIt: Story = {
	args: {
		leader: {
			handle: "@marcianoschildmeijer",
			userId: "marcianoschildmeijer",
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
			userId: "giovanni",
			figure: "9 in a row",
		},
	},
};

export const NoGithubToLinkTo: Story = {
	args: {
		leader: { userId: "oak", handle: "Professor Oak", figure: "9 in a row" },
	},
};

export const EquippedBorder: Story = {
	args: {
		leader: {
			handle: "@sabrina",
			userId: "sabrina",
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

const STREAK_BOARD = [
	{ category: "JavaScript", handle: "@koga", figure: "21 in a row" },
	{ category: "CSS", handle: "@erika", figure: "18 in a row" },
	{ category: "Git", handle: "@giovanni", figure: "13 in a row" },
];

const CORRECT_BOARD = [
	{ category: "TypeScript", handle: "@brock", figure: "58 correct" },
	{ category: "JavaScript", handle: "@koga", figure: "47 correct" },
	{ category: "React", handle: "@erika", figure: "41 correct" },
];

const BoardPanel = ({
	label,
	meta,
	rows,
	openCategory,
	claim,
}: {
	label: string;
	meta: string;
	rows: typeof STREAK_BOARD;
	openCategory: string;
	claim: string;
}) => (
	<Panel>
		<Panel.Header label={label} meta={meta} />
		<Panel.Rows>
			{rows.map(({ category, handle, figure }) => (
				<Panel.Row key={category}>
					<CategoryLeader
						category={category}
						leader={{ userId: handle.slice(1), handle, figure }}
					/>
				</Panel.Row>
			))}
			<Panel.Row>
				<CategoryLeader category={openCategory} claim={claim} />
			</Panel.Row>
		</Panel.Rows>
		<Panel.Footer>
			<Typography variant="hint" as="span">
				A seat changes hands when somebody beats it.
			</Typography>
		</Panel.Footer>
	</Panel>
);

export const OnTheBoard: Story = {
	render: () => (
		<Screen theme="viridian" width="narrow">
			<BoardPanel
				label="Streak leaders"
				meta="All-time longest run streak"
				rows={STREAK_BOARD}
				openCategory="Vue"
				claim="3 in a row claims it"
			/>
		</Screen>
	),
};

export const OnTheCorrectBoard: Story = {
	render: () => (
		<Screen theme="viridian" width="narrow">
			<BoardPanel
				label="Correct leaders"
				meta="All-time longest run of correct answers"
				rows={CORRECT_BOARD}
				openCategory="Vue"
				claim="4 correct claims it"
			/>
		</Screen>
	),
};

export const InANarrowColumn: Story = {
	render: () => (
		<div className="max-w-[380px]">
			<Screen theme="viridian" width="narrow">
				<Panel>
					<Panel.Header label="Streak leaders" />
					<Panel.Rows>
						<Panel.Row>
							<CategoryLeader
								category="General Frontend"
								leader={{
									handle: "@marcianoschildmeijer",
									userId: "marcianoschildmeijer",
									figure: "21 in a row",
									photoUrl: PORTRAIT,
								}}
							/>
						</Panel.Row>
					</Panel.Rows>
				</Panel>
			</Screen>
		</div>
	),
};
