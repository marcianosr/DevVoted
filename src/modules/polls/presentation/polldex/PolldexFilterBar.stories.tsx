import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	presentCategories,
	type PolldexCategoryFilter,
} from "../../polldex/polldex.model";
import { SAMPLE_POLLDEX_ENTRIES } from "./polldex.fixtures";
import { PolldexFilterBar } from "./PolldexFilterBar.ui";

const meta: Meta<typeof PolldexFilterBar> = {
	component: PolldexFilterBar,
	title: "Polldex/PolldexFilterBar",
	decorators: [
		(Story) => (
			<div className="bg-black p-6">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PolldexFilterBar>;

const Interactive = () => {
	const [selected, setSelected] = useState<PolldexCategoryFilter>("all");
	return (
		<PolldexFilterBar
			categories={presentCategories(SAMPLE_POLLDEX_ENTRIES)}
			selected={selected}
			onSelect={setSelected}
		/>
	);
};

export const Default: Story = { render: () => <Interactive /> };
