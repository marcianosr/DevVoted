import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/styles/app.css";

const preview: Preview = {
	decorators: [
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
