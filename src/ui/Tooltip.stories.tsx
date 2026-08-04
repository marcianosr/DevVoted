import type { Meta, StoryObj } from "@storybook/react";

import { Tooltip } from "./Tooltip.component";

const meta: Meta<typeof Tooltip> = {
	component: Tooltip,
	title: "UI/Tooltip",
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
	args: {
		content: "Hover revealed me.",
		children: (
			<button
				type="button"
				className="rounded bg-cerulean px-3 py-2 text-black"
			>
				Hover me
			</button>
		),
	},
};

/** Fit-content one-liner — used for voter-name chips on the community board. */
export const Compact: Story = {
	args: {
		compact: true,
		content: "Gary Oak",
		children: (
			<span
				tabIndex={0}
				className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-viridian text-xs text-white"
			>
				go
			</span>
		),
	},
};
