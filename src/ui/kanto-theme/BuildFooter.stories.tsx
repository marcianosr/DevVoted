import type { Meta, StoryObj } from "@storybook/react";

import {
	createKantoBuildFooterProps,
	createKantoBuildProps,
	createKantoQuestionProps,
} from "~/test/kantoPoll.factory";

import { BuildFooter } from "./BuildFooter.ui";
import { Question } from "./Question.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const BARE_COUNTS = { ready: 0, applies: 0, offline: 0, changing: 0 };

const meta: Meta<typeof BuildFooter> = {
	component: BuildFooter,
	title: "Kanto/BuildFooter",
	argTypes: {
		open: { control: "boolean" },
	},
	args: createKantoBuildFooterProps(),
	render: (args) => (
		<Screen theme="vermillion">
			<BuildFooter {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof BuildFooter>;

export const Folded: Story = { args: { open: false } };

export const Unfolded: Story = { args: { open: true } };

export const NothingChanging: Story = {
	args: {
		open: false,
		counts: { ready: 2, applies: 9, offline: 0, changing: 0 },
	},
};

export const Bare: Story = {
	args: {
		open: false,
		counts: BARE_COUNTS,
		build: createKantoBuildProps({ configs: [], skipped: [] }),
	},
};

export const StickingUnderAScrollingPoll: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="h-[32rem] overflow-y-auto">
			<Screen theme="vermillion">
				<Question {...createKantoQuestionProps()} />
				<Question {...createKantoQuestionProps()} />
				<Typography variant="hint">
					Scroll: the footer holds the bottom while the poll runs under it.
				</Typography>
				<BuildFooter {...createKantoBuildFooterProps({ open: false })} />
			</Screen>
		</div>
	),
};
