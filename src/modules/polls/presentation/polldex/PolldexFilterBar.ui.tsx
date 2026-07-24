import {
	getCategoryMetadata,
	type CategoryCode,
} from "~/domains/shared/categories";
import { Button } from "~/ui/Button.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";

import type { PolldexCategoryFilter } from "../../polldex/polldex.model";

type PolldexFilterBarProps = {
	categories: CategoryCode[];
	selected: PolldexCategoryFilter;
	onSelect: (category: PolldexCategoryFilter) => void;
};

/**
 * "All categories" + one toggle Button per present category. The selected
 * button glows in its Kanto color via `data-category-theme` + `isSelected`.
 */
export const PolldexFilterBar = ({
	categories,
	selected,
	onSelect,
}: PolldexFilterBarProps) => (
	<div className="flex flex-wrap gap-2">
		<Button
			variant="theme"
			size="small"
			isSelected={selected === "all"}
			onClick={() => onSelect("all")}
		>
			All categories
		</Button>
		{categories.map((category) => (
			<Button
				key={category}
				variant="theme"
				size="small"
				isSelected={selected === category}
				onClick={() => onSelect(category)}
				{...categoryTheme(category)}
			>
				{getCategoryMetadata(category).name}
			</Button>
		))}
	</div>
);
