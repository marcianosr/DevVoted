import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_UNITS } from "~/lib/storage";
import { PipelineUpgradeCard } from "./PipelineUpgradeCard.ui";

const meta: Meta<typeof PipelineUpgradeCard> = {
	component: PipelineUpgradeCard,
	title: "Runs/PipelineUpgradeCard",
	args: { onToggle: () => {}, selected: false },
};
export default meta;

type Story = StoryObj<typeof PipelineUpgradeCard>;

export const AddPipelineLowRisk: Story = {
	args: {
		badge: "Add pipeline",
		title: "Category mastery pipeline",
		slug: "category-mastery",
		reward: STORAGE_UNITS.KB * 60,
		needs: "≥1 JavaScript correct (or all, if fewer)",
		description: "Add a new check — every check must pass at the next gate.",
		riskClassName: "text-blue-400 border-blue-400",
	},
};

export const UpgradeHighRisk: Story = {
	args: {
		badge: "Upgrade",
		title: "Correct answer pipeline",
		slug: "correct-answers",
		reward: STORAGE_UNITS.KB * 120,
		needs: "3 correct",
		description: "Strengthen an existing check for a bigger payout.",
		riskClassName: "text-orange-400 border-orange-400",
	},
};

export const Selected: Story = {
	args: { ...AddPipelineLowRisk.args, selected: true },
};
