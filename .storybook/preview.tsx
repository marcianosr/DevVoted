import type { Decorator, Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/styles/app.css";

// A wrapper rather than a side effect on <body>: the attributes go up and down
// with the story, so nothing leaks between the preview and the docs page. Both
// live on one element because both are inherited text properties.
const withType: Decorator = (Story, { globals }) => (
	<div data-font={globals.font} data-tracking={globals.tracking}>
		<Story />
	</div>
);

const preview: Preview = {
	globalTypes: {
		font: {
			description: "Typeface the reskin is judged in",
			toolbar: {
				title: "Font",
				icon: "paragraph",
				items: [
					{ value: "jetbrains-mono", title: "JetBrains Mono (current)" },
					{ value: "space-mono", title: "Space Mono" },
				],
				dynamicTitle: true,
			},
		},
		tracking: {
			description: "Letter-spacing the reskin is judged at",
			toolbar: {
				title: "Tracking",
				icon: "collapse",
				items: [
					{ value: "tight", title: "−0.025em (current)" },
					{ value: "tighter", title: "−0.05em (tracking-tighter)" },
					{ value: "half-pixel", title: "−0.5px (fixed)" },
					{ value: "loose", title: "0.01em (was)" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: { font: "jetbrains-mono", tracking: "tight" },
	decorators: [
		withType,
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
