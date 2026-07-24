import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	filterPolldexEntries,
	presentCategories,
	type PolldexCategoryFilter,
} from "../../polldex/polldex.model";
import { PolldexPanel } from "./PolldexPanel.ui";
import { SAMPLE_POLLDEX_ENTRIES } from "./polldex.fixtures";

const meta: Meta<typeof PolldexPanel> = {
	component: PolldexPanel,
	title: "Dex/PolldexPanel",
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-gray-950 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PolldexPanel>;

const Interactive = () => {
	const [category, setCategory] = useState<PolldexCategoryFilter>("all");
	return (
		<PolldexPanel
			entries={filterPolldexEntries(SAMPLE_POLLDEX_ENTRIES, category)}
			categories={presentCategories(SAMPLE_POLLDEX_ENTRIES)}
			selectedCategory={category}
			onSelectCategory={setCategory}
		/>
	);
};

export const Default: Story = { render: () => <Interactive /> };
