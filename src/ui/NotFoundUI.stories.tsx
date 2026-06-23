import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundUI } from "./NotFoundUI.component";

const meta: Meta<typeof NotFoundUI> = {
	component: NotFoundUI,
	title: "UI/NotFoundUI",
};
export default meta;

type Story = StoryObj<typeof NotFoundUI>;

export const Default: Story = {
	args: {
		onGoBack: () => {},
		homeLink: (
			<a
				href="/"
				className="bg-cyan-600 text-white px-2 py-1 rounded uppercase font-black text-sm"
			>
				Start Over
			</a>
		),
	},
};

export const WithCustomMessage: Story = {
	args: {
		onGoBack: () => {},
		homeLink: <a href="/">Home</a>,
		children: <p>This run no longer exists.</p>,
	},
};
