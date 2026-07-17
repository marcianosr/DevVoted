import type { CategoryCode } from "~/domains/shared/categories";

/**
 * Theme a subtree in a category's Kanto color. app.css is the single source of truth:
 * `[data-category-theme="js"] { --theme-color: var(--color-saffron) }`. Spread this onto a
 * container, then style descendants with the `.text-theme` / `.bg-theme` / `.border-theme`
 * / `.bg-theme-soft` utilities. No color values are duplicated in TS.
 */
export const categoryTheme = (
	category: CategoryCode
): { "data-category-theme": CategoryCode } => ({
	"data-category-theme": category,
});
