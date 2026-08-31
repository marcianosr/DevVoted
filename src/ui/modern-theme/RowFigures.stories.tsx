import type { Meta, StoryObj } from "@storybook/react";

import { Delta } from "./Delta.ui";
import { PriceTag } from "./PriceTag.ui";
import { RowFigures } from "./RowFigures.ui";

const meta: Meta<typeof RowFigures> = {
	component: RowFigures,
	title: "Modern/RowFigures",
	decorators: [
		(Story) => (
			<div className="w-96 bg-surface p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof RowFigures>;

export const OneSlot: Story = {
	args: { slots: 1, figure: <Delta multiplier={1.25} /> },
};

export const EightSlots: Story = {
	args: { slots: 8, figure: <Delta multiplier={2} /> },
};

export const SizeOnly: Story = { args: { slots: 1 } };

export const FigureOnly: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<RowFigures figure={<PriceTag kb={32} on=".vue" onUse={() => {}} />} />
			<RowFigures
				figure={<PriceTag kb={128} on="Intellisense" onUse={() => {}} />}
			/>
			<RowFigures figure={<PriceTag kb={512} on="WTFPL" onUse={() => {}} />} />
		</div>
	),
};

export const Stacked: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			<RowFigures slots={1} figure={<Delta multiplier={1.25} />} />
			<RowFigures slots={2} figure={<Delta coverage={0.5} />} />
			<RowFigures slots={4} figure={<Delta multiplier={1.6} />} />
			<RowFigures slots={8} figure={<Delta multiplier={3.4} />} />
		</div>
	),
};
