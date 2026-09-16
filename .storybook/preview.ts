import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/styles/app.css";
import { ACTIVE_SKIN } from "../src/config/skin";

// Mirror the app shell: __root.tsx puts these on <body>, and text without its
// own colour class inherits from there — without them stories render dark text.
document.body.classList.add("bg-black", "text-white");

// Mirror the app: the active skin is set on <html>, so stories show it too.
if (ACTIVE_SKIN) {
	document.documentElement.dataset.skin = ACTIVE_SKIN;
}

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
