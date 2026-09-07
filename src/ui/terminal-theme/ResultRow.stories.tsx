import type { Meta, StoryObj } from "@storybook/react";

import { ResultRow } from "./ResultRow.ui";

const meta: Meta<typeof ResultRow> = {
	component: ResultRow,
	title: "Terminal/ResultRow",
	decorators: [
		(Story) => (
			<ul className="flex max-w-2xl flex-col gap-3 p-4">
				<Story />
			</ul>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ResultRow>;

export const RightAnswer: Story = {
	args: {
		letter: "A",
		label: "string",
		percent: 22,
		right: true,
		yours: false,
	},
};

export const YourMiss: Story = {
	args: {
		letter: "B",
		label: "number",
		percent: 68,
		right: false,
		yours: true,
	},
};

export const AlsoRan: Story = {
	args: {
		letter: "C",
		label: "unknown",
		percent: 7,
		right: false,
		yours: false,
	},
};

export const TheMockPoll: Story = {
	render: () => (
		<>
			<ResultRow letter="A" label="string" percent={22} right yours={false} />
			<ResultRow letter="B" label="number" percent={68} right={false} yours />
			<ResultRow
				letter="C"
				label="unknown"
				percent={7}
				right={false}
				yours={false}
			/>
			<ResultRow
				letter="D"
				label="never"
				percent={3}
				right={false}
				yours={false}
			/>
		</>
	),
};
