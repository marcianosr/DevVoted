/**
 * Enforces ADR-002's layer dependency rule:
 * interface → application → domain; infrastructure only via application.
 * Run with `npm run lint:arch`.
 */
module.exports = {
	forbidden: [
		{
			name: "engine-stays-pure-no-react",
			comment:
				"Module engine code (everything except presentation/components/hooks/api) is framework-free — ADR-002 domain layer",
			severity: "error",
			from: {
				path: "^src/(modules|domains)/[^/]+/",
				pathNot: "/(presentation|components|hooks|api)/",
			},
			to: { path: "^react(-dom)?$" },
		},
		{
			name: "engine-stays-pure-no-db",
			comment:
				"Module engine code never touches Drizzle or the database at runtime — ADR-002 domain layer. Type-only imports are the DTO seam and stay allowed. Known legacy exception: userSync.service (DVTD follow-up bean).",
			severity: "error",
			from: {
				path: "^src/(modules|domains)/[^/]+/",
				pathNot: "/(api|factories)/|userSync\\.service\\.ts$",
			},
			to: {
				path: "drizzle-orm|^src/database/",
				dependencyTypesNot: ["type-only"],
			},
		},
		{
			name: "interface-not-into-queries",
			comment:
				"Presentation and routes reach data through server functions/handlers, never queries directly — ADR-002 dependency rule",
			severity: "error",
			from: { path: "/presentation/|^src/routes/" },
			to: { path: "/api/queries" },
		},
		{
			name: "ui-stays-presentational",
			comment:
				"src/ui may only take types from modules (plain data props) — no runtime imports of hooks, queries, or server functions",
			severity: "error",
			from: { path: "^src/ui/", pathNot: "\\.stories\\." },
			to: {
				path: "^src/(modules|domains)/",
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
