import type { Meta, StoryObj } from "@storybook/react";

import { getCategories } from "../../domains/shared/categories";
import { Swatch } from "../Swatch.component";
import { categoryTheme } from "./categoryTheme";

const meta: Meta = {
	title: "Design System/Category Colors",
};
export default meta;

type Story = StoryObj;

export const Swatches: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			{getCategories().map(({ code, name }) => (
				<div
					key={code}
					{...categoryTheme(code)}
					className="flex items-center gap-3"
				>
					<Swatch size="lg" />
					<span className="text-theme text-lg">{name}</span>
					<span className="text-sm text-zinc-500">{code}</span>
				</div>
			))}
		</div>
	),
};
