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
	"java",
	"python",
	"ruby",
	"general-backend",
] as const;
export type CategoryCode = (typeof CATEGORY_CODES)[number];

export const CATEGORY_METADATA = {
	css: { name: "CSS" },
	js: { name: "JavaScript" },
	react: { name: "React" },
	ts: { name: "TypeScript" },
	git: { name: "Git" },
	html: { name: "HTML" },
	java: { name: "Java" },
	"general-frontend": { name: "General Frontend" },
	python: { name: "Python" },
	ruby: { name: "Ruby" },
	"general-backend": { name: "General Backend" },
} as const satisfies Record<CategoryCode, { name: string }>;

/**
 * Get categories with both code and name for UI components and database operations
 */
export const getCategories = () =>
	CATEGORY_CODES.map((code) => ({
		code,
		name: CATEGORY_METADATA[code].name,
	}));

/**
 * Get metadata for a specific category code
 */
export const getCategoryMetadata = (categoryCode: CategoryCode) =>
	CATEGORY_METADATA[categoryCode];
