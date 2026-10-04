import type { Meta, StoryObj } from "@storybook/react";

import {
	kantoPrepChampion,
	kantoPrepPrefetched,
	kantoPrepPrefetchedAtV1,
	kantoPrepSealed,
} from "~/test/kantoPoll.factory";

import { PollTiles } from "./PollTiles.ui";
import { Screen } from "./Screen.ui";

const meta: Meta<typeof PollTiles> = {
	component: PollTiles,
	title: "Kanto/PollTiles",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<PollTiles {...args} />
		</Screen>
	),
	args: kantoPrepSealed().polls,
};
export default meta;

type Story = StoryObj<typeof PollTiles>;

export const Sealed: Story = {};

export const PrefetchV1: Story = { args: kantoPrepPrefetchedAtV1().polls };

export const PrefetchV2: Story = { args: kantoPrepPrefetched().polls };

export const AtTheSummit: Story = { args: kantoPrepChampion().polls };
