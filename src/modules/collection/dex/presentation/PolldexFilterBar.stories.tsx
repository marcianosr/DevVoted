import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
	presentCategories,
	type PolldexCategoryFilter,
	type PolldexSeenFilter,
} from "~/modules/collection/dex/domain/polldex.model";
import { SAMPLE_POLLDEX_ENTRIES } from "~/modules/collection/dex/presentation/polldex.factory";
import { PolldexFilterBar } from "~/modules/collection/dex/presentation/PolldexFilterBar.ui";

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
	const [seen, setSeen] = useState<PolldexSeenFilter>("all");
	return (
		<PolldexFilterBar
			categories={presentCategories(SAMPLE_POLLDEX_ENTRIES)}
			selected={selected}
			onSelect={setSelected}
			selectedSeen={seen}
			onSelectSeen={setSeen}
		/>
	);
};

export const Default: Story = { render: () => <Interactive /> };
