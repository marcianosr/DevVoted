import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: [
		"../src/ui/**/*.stories.@(ts|tsx)",
		"../src/modules/**/*.stories.@(ts|tsx)",
	],
	addons: ["@storybook/addon-themes"],
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: { viteConfigPath: ".storybook/vite.config.ts" },
		},
	},
};

export default config;
