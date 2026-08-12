/**
 * ADR-002 §3. Two rule sets: LAYERED matches the migrated
 * context/aggregate/layer shape (only `modules/run/` today), LEGACY guards what
 * still uses `api/` + `presentation/{concept}/`. Delete each legacy rule as its
 * slice migrates (DVTD-36ct).
 *
 * Type-only imports pass every rule: types are contracts, not coupling.
 */

const AGG = "^src/modules/[^/]+/[^/]+";
const LEGACY_FROM = "^src/domains/[^/]+/";
/** Dev rigs: they drive the engine directly, so runtime domain imports are expected. */
const DEV_RIG_ROUTES = "^src/routes/proto-(run|session-slice)\\.tsx$";

module.exports = {
	forbidden: [
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
			comment: "a route mounts a presentation component and stops there",
			severity: "error",
			from: { path: "^src/routes/", pathNot: DEV_RIG_ROUTES },
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
				path: "^src/(modules|domains)/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "shared-not-into-modules",
			comment: "shared code is imported BY modules, never the reverse",
			severity: "error",
			from: { path: "^src/shared/", pathNot: "\\.spec\\.tsx?$" },
			to: {
				path: "^src/(modules|domains)/",
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
		{
			name: "legacy-engine-stays-pure-no-react",
			comment: "pre-ADR-002 layout: engine code is framework-free",
			severity: "error",
			from: {
				path: LEGACY_FROM,
				pathNot: "/(presentation|components|hooks|api)/",
			},
			to: { path: "^react(-dom)?$" },
		},
		{
			name: "legacy-engine-stays-pure-no-db",
			// userSync.service is a known exception, tracked in DVTD-iide
			comment: "pre-ADR-002 layout: engine code never touches Drizzle",
			severity: "error",
			from: {
				path: LEGACY_FROM,
				pathNot: "/(api|factories)/|userSync\\.service\\.ts$",
			},
			to: {
				path: "drizzle-orm|^src/database/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "legacy-interface-not-into-queries",
			comment: "pre-ADR-002 layout: reach data through handlers, not queries",
			severity: "error",
			from: { path: "/presentation/|^src/routes/" },
			to: {
				path: "/api/queries",
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
