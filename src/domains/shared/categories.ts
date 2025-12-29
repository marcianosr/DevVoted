/**
 * Centralized poll category constants
 * Single source of truth for all category-related code across the application
 */

export const CATEGORY_CODES = [
	"css",
	"js",
	"react",
	"ts",
	"html",
	"git",
	"general-frontend",
	"vue",
	"angular",
	"nextjs",
] as const;
export type CategoryCode = (typeof CATEGORY_CODES)[number];

export const CATEGORY_GROUPS = ["Frontend Frameworks"] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

type CategoryMeta = { name: string; group?: CategoryGroup };

export const CATEGORY_METADATA: Record<CategoryCode, CategoryMeta> = {
	css: { name: "CSS" },
	js: { name: "JavaScript" },
	ts: { name: "TypeScript" },
	html: { name: "HTML" },
	git: { name: "Git" },
	"general-frontend": { name: "General Frontend" },
	// Frontend Frameworks group:
	react: { name: "React", group: "Frontend Frameworks" },
	vue: { name: "Vue", group: "Frontend Frameworks" },
	angular: { name: "Angular", group: "Frontend Frameworks" },
	nextjs: { name: "Next.js", group: "Frontend Frameworks" },
};

/**
 * Get categories with code, name, and group for UI components and database operations
 */
export const getCategories = () =>
	CATEGORY_CODES.map((code) => ({
		code,
		name: CATEGORY_METADATA[code].name,
		category_group: CATEGORY_METADATA[code].group ?? null,
	}));

/**
 * Get metadata for a specific category code
 */
export const getCategoryMetadata = (categoryCode: CategoryCode) =>
	CATEGORY_METADATA[categoryCode];

/**
 * Get all category codes that belong to a specific group
 */
export const getCategoriesByGroup = (group: CategoryGroup): CategoryCode[] =>
	CATEGORY_CODES.filter((code) => CATEGORY_METADATA[code].group === group);

/**
 * Get categories organized by their groups
 * Returns { grouped: { "Frontend Frameworks": ["react", "vue", ...] }, ungrouped: ["css", "js", ...] }
 */
export const getGroupedCategories = () => {
	const grouped: Partial<Record<CategoryGroup, CategoryCode[]>> = {};
	const ungrouped: CategoryCode[] = [];

	for (const code of CATEGORY_CODES) {
		const group = CATEGORY_METADATA[code].group;
		if (group) {
			grouped[group] = grouped[group] || [];
			grouped[group].push(code);
		} else {
			ungrouped.push(code);
		}
	}

	return { grouped, ungrouped };
};
