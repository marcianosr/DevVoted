import type { Meta, StoryObj } from "@storybook/react";
import { CatchBoundaryUI } from "./CatchBoundaryUI.component";

const meta: Meta<typeof CatchBoundaryUI> = {
	component: CatchBoundaryUI,
	title: "UI/CatchBoundaryUI",
};
export default meta;

type Story = StoryObj<typeof CatchBoundaryUI>;

export const Default: Story = {
	args: {
		errorDisplay: (
			<p className="text-red-400">Something went wrong loading this page.</p>
		),
		onRetry: () => {},
		navigationLink: (
			<a
				href="/"
				className="px-2 py-1 bg-gray-700 rounded text-white uppercase font-extrabold text-sm"
			>
				Go Back
			</a>
		),
	},
};
