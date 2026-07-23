import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type CategoryTagProps = {
	category: CategoryCode;
	name: string;
};

export const CategoryTag = ({ category, name }: CategoryTagProps) => (
	<span
		{...categoryTheme(category)}
		className="inline-block rounded bg-theme-soft px-2 py-1 text-xs font-extrabold text-theme"
	>
		{name}
	</span>
);
