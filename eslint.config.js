import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

/** @type { import("eslint").Linter.Config[] } */
const eslintConfig = [
	// Ignore patterns
	{
		ignores: [
			"**/dist/**",
			"**/build/**",
			"**/.vinxi/**",
			"**/.nitro/**",
			"**/.output/**",
			"**/.vercel/**",
			"**/node_modules/**",
			"**/*.config.js",
			"**/*.config.ts",
			"**/scripts/**",
			"**/sonar-scanner.cjs",
			"**/database/seed.ts",
			"**/database/reset.ts",
		],
	},

	// Use compatibility layer for existing configs
	...compat.extends(
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript"
	),

	// Prettier config (disables conflicting rules)
	eslintConfigPrettier,

	// Custom rules
	{
		settings: {
			react: {
				version: "detect",
			},
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.json",
				},
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
			},
		},
		rules: {
			// TypeScript
			"@typescript-eslint/no-explicit-any": "off", // Temporarily disabled
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],

			// React
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",

			// Import ordering
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						["parent", "sibling"],
						"index",
						"object",
						"type",
					],
					pathGroups: [
						{
							pattern: "react",
							group: "external",
							position: "before",
						},
						{
							pattern: "~/**",
							group: "internal",
						},
						{
							pattern: "@/src/**",
							group: "internal",
						},
					],
					pathGroupsExcludedImportTypes: ["react"],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],

			// Console warnings (allow warn, error, info)
			"no-console": [
				"warn",
				{
					allow: ["warn", "error", "info"],
				},
			],
		},
	},
];

export default eslintConfig;
