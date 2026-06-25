import type { Preview, Renderer, StoryFn } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/styles/app.css";

const withAppBackground = (Story: StoryFn<Renderer>) => (
	<div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4">
		<Story />
	</div>
);

const preview: Preview = {
	decorators: [
		withAppBackground,
		withThemeByClassName({
			themes: {
				dark: "dark",
				light: "",
			},
			defaultTheme: "dark",
		}),
	],
	parameters: {
		backgrounds: { disable: true },
	},
};

export default preview;
