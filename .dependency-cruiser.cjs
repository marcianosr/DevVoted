/**
 * ADR-002 §3. One rule set: every module lives in the
 * context/aggregate/layer shape. `src/domains/` is gone (DVTD-wj1t), and with
 * it the `legacy-*` rules that guarded it.
 *
 * Type-only imports pass every rule: types are contracts, not coupling.
 */

const AGG = "^src/modules/[^/]+/[^/]+";
/** The root route builds the router context in `beforeLoad`, which runs before
 * any component exists — so it cannot reach its data by mounting one. */
const ROOT_ROUTE = "^src/routes/__root\\.tsx$";
/** The kanto reference rig drives the engine directly, so runtime domain
 * imports are expected. (proto-session-slice was deleted with the old engine.) */
const DEV_RIG_ROUTE = "^src/routes/proto-run\\.tsx$";
/** TanStack generates routeTree and pairs it with router.tsx; the cycle is theirs. */
const GENERATED_ROUTER = "^src/(router\\.tsx|routeTree\\.gen\\.ts)$";

module.exports = {
	forbidden: [
		{
			name: "no-circular-runtime",
			comment:
				"Aggregates may depend on each other's types freely (CONTEXT.md assigns " +
				"each term one owner), but a runtime cycle means neither module can be " +
				"loaded, read or tested without the other. Exempt: the generated route " +
				"tree, which TanStack Router pairs with router.tsx by design.",
			severity: "error",
			from: { pathNot: GENERATED_ROUTER },
			to: {
				circular: true,
				dependencyTypesNot: ["type-only"],
				pathNot: GENERATED_ROUTER,
			},
		},
		{
			name: "domain-stays-pure-no-react",
			comment: "domain/ is the game engine: no framework imports",
			severity: "error",
			from: { path: `${AGG}/domain/` },
			to: { path: "^react(-dom)?$|^@tanstack/" },
		},
		{
			name: "domain-stays-pure-no-db",
			comment: "domain/ never touches Drizzle; persistence is infrastructure/",
			severity: "error",
			from: { path: `${AGG}/domain/` },
			to: {
				path: "drizzle-orm|^src/database/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "domain-imports-only-domain",
			comment: "domain/ may import domain/ only, including other aggregates'",
			severity: "error",
			from: { path: `${AGG}/domain/`, pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: `${AGG}/(application|infrastructure|presentation)/`,
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "presentation-not-into-infrastructure",
			comment: "reach data through an application hook or server function",
			severity: "error",
			from: { path: `${AGG}/presentation/` },
			to: {
				path: `${AGG}/infrastructure/`,
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "infrastructure-stays-below",
			comment: "infrastructure/ may depend on domain/ only",
			severity: "error",
			from: { path: `${AGG}/infrastructure/`, pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: `${AGG}/(application|presentation)/`,
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "application-not-into-presentation",
			comment: "application/ shapes state for the UI but never imports it",
			severity: "error",
			from: { path: `${AGG}/application/`, pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: `${AGG}/presentation/`,
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "routes-only-into-presentation",
			comment:
				"a route mounts a presentation component and stops there; __root is " +
				"exempt because beforeLoad has no component to mount",
			severity: "error",
			from: {
				path: "^src/routes/",
				pathNot: `${DEV_RIG_ROUTE}|${ROOT_ROUTE}`,
			},
			to: {
				path: `${AGG}/(domain|application|infrastructure)/`,
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "modules-not-into-routes",
			comment: "code needed by both routes and modules belongs in src/shared",
			severity: "error",
			from: { path: "^src/modules/" },
			to: { path: "^src/routes/" },
		},
		{
			name: "ui-stays-presentational",
			comment: "src/ui takes types from modules, never runtime values",
			severity: "error",
			from: { path: "^src/ui/", pathNot: "\\.stories\\." },
			to: {
				path: "^src/modules/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "shared-not-into-modules",
			comment: "shared code is imported BY modules, never the reverse",
			severity: "error",
			from: { path: "^src/shared/", pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: "^src/modules/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "domain-into-shared-lib-only",
			comment: "of src/shared, domain/ may reach only the pure helpers in lib/",
			severity: "error",
			from: { path: `${AGG}/domain/`, pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: "^src/shared/(?!lib/)",
				dependencyTypesNot: ["type-only"],
			},
		},
	],
	options: {
		doNotFollow: { path: "node_modules" },
		tsConfig: { fileName: "tsconfig.json" },
		tsPreCompilationDeps: true,
	},
};
