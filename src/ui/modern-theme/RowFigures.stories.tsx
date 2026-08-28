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

export const ABit: Story = {
	args: { grade: "bit", figure: <Delta multiplier={1.25} /> },
};

export const AByte: Story = {
	args: { grade: "byte", figure: <Delta multiplier={2} /> },
};

export const GradeOnly: Story = { args: { grade: "crumb" } };

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
			<RowFigures grade="bit" figure={<Delta multiplier={1.25} />} />
			<RowFigures grade="crumb" figure={<Delta coverage={0.5} />} />
			<RowFigures grade="nibble" figure={<Delta multiplier={1.6} />} />
			<RowFigures grade="byte" figure={<Delta multiplier={3.4} />} />
		</div>
	),
};
