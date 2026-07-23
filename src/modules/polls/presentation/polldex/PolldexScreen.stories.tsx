import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	filterPolldexEntries,
	polldexCoverage,
	presentCategories,
	type PolldexCategoryFilter,
} from "../../polldex/polldex.model";
import { SAMPLE_POLLDEX_ENTRIES } from "./polldex.fixtures";
import { PolldexScreen } from "./PolldexScreen.ui";

const meta: Meta<typeof PolldexScreen> = {
	component: PolldexScreen,
	title: "Polldex/PolldexScreen",
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-gray-950">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PolldexScreen>;

const Interactive = () => {
	const [category, setCategory] = useState<PolldexCategoryFilter>("all");

	return (
		<PolldexScreen
			entries={filterPolldexEntries(SAMPLE_POLLDEX_ENTRIES, category)}
			coverage={polldexCoverage(SAMPLE_POLLDEX_ENTRIES)}
			categories={presentCategories(SAMPLE_POLLDEX_ENTRIES)}
			selectedCategory={category}
			onSelectCategory={setCategory}
		/>
	);
};

export const Default: Story = { render: () => <Interactive /> };
