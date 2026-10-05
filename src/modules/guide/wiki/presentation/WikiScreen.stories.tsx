import type { Meta, StoryObj } from "@storybook/react";

import { wikiScreenFor } from "~/modules/guide/wiki/application/wikiArticles.viewmodel";
import { WikiScreen } from "~/modules/guide/wiki/presentation/WikiScreen.ui";

const meta = {
	title: "Guide/WikiScreen",
	component: WikiScreen,
	args: wikiScreenFor("how-to-play"),
} satisfies Meta<typeof WikiScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HowToPlay: Story = {};

export const GateLadder: Story = { args: wikiScreenFor("gates") };

export const ConfigRoster: Story = { args: wikiScreenFor("build-and-configs") };

export const Glossary: Story = { args: wikiScreenFor("glossary") };
