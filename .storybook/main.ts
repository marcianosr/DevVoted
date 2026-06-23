import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
	stories: ["../src/ui/**/*.stories.@(ts|tsx)"],
	addons: ["@storybook/addon-themes"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	viteFinal: (config) => {
		config.plugins = config.plugins ?? [];
		config.plugins.push(tsConfigPaths());
		config.plugins.push(tailwindcss());
		return config;
	},
};

export default config;
