import type { Meta, StoryObj } from "@storybook/react";

import { getCategories } from "../../domains/shared/categories";
import { categoryTheme } from "./categoryTheme";

const meta: Meta = {
	title: "Design System/Category Colors",
};
export default meta;

type Story = StoryObj;

/** The Kanto color each category wears, via app.css `[data-category-theme]` + `.bg-theme`/`.text-theme`. */
export const Swatches: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			{getCategories().map(({ code, name }) => (
				<div
					key={code}
					{...categoryTheme(code)}
					className="flex items-center gap-3"
				>
					<span className="bg-theme inline-block h-6 w-6 rounded" />
					<span className="text-theme text-lg">{name}</span>
					<span className="text-sm text-zinc-500">{code}</span>
				</div>
			))}
		</div>
	),
};
