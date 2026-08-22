import type { Meta, StoryObj } from "@storybook/react";

import { Caret } from "./Caret.ui";

const meta: Meta<typeof Caret> = {
	component: Caret,
	title: "Modern/Caret",
};
export default meta;

type Story = StoryObj<typeof Caret>;

export const BothStates: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<details open className="group/fold">
				<summary className="list-none">
					<Caret /> open
				</summary>
			</details>
			<details className="group/fold">
				<summary className="list-none">
					<Caret /> closed
				</summary>
			</details>
		</div>
	),
};
