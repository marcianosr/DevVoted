import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/styles/app.css";

// Mirror the app shell: __root.tsx puts these on <body>, and text without its
// own colour class inherits from there — without them stories render dark text.
document.body.classList.add("bg-black", "text-white");

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
		options: { storySort: { order: ["Terminal", "*", "Old"] } },
	},
};

export default preview;
