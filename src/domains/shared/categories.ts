/**
 * Centralized poll category constants
 * Single source of truth for all category-related code across the application
 */

export const CATEGORY_CODES = ['css', 'js', 'react', 'typescript', 'general-frontend'] as const;
export type CategoryCode = typeof CATEGORY_CODES[number];

export const CATEGORY_METADATA = {
	css: { name: 'CSS' },
	js: { name: 'JavaScript' },
	react: { name: 'React' },
	typescript: { name: 'TypeScript' },
	'general-frontend': { name: 'General Frontend' }
} as const satisfies Record<CategoryCode, { name: string }>;

/**
 * Get categories with both code and name for UI components and database operations
 */
export const getCategories = () => CATEGORY_CODES.map(code => ({ 
	code, 
	name: CATEGORY_METADATA[code].name 
}));