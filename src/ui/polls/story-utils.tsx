import type { ReactNode } from "react";

/**
 * Wraps a story in a category-themed section so the `*-theme` utilities resolve,
 * mirroring how ContentSection scopes the theme in the app.
 */
export const withCategoryTheme = (categoryCode = "js") => {
	const CategoryThemeDecorator = (Story: () => ReactNode) => (
		<section data-category-theme={categoryCode} className="p-6 bg-black">
			<Story />
		</section>
	);
	return CategoryThemeDecorator;
};
