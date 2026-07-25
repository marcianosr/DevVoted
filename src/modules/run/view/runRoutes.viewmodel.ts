import type { RunView } from "./runView.viewmodel";

export const RUN_ROUTES = {
	start: "/run",
	configure: "/run/configure",
	answer: "/run/answer",
	reward: "/run/reward",
	shop: "/run/shop",
	strip: "/run/strip",
	over: "/run/over",
} as const;

export type RunRoutePath = (typeof RUN_ROUTES)[keyof typeof RUN_ROUTES];

/**
 * The server owns the run's state machine; the URL only projects it. This maps
 * each status to the route(s) allowed to show it — first entry is canonical.
 * "rewarding" spans two routes because the reward → shop hop is a user-driven
 * page turn within one server status.
 */
export const routesForStatus = (
	view: Pick<RunView, "status"> | null
): readonly [RunRoutePath, ...RunRoutePath[]] => {
	if (!view) return [RUN_ROUTES.start];
	switch (view.status) {
		case "configuring":
			return [RUN_ROUTES.configure];
		case "answering":
			return [RUN_ROUTES.answer];
		case "rewarding":
			return [RUN_ROUTES.reward, RUN_ROUTES.shop];
		case "awaiting-strip":
			return [RUN_ROUTES.strip];
		case "won":
		case "dead":
			return [RUN_ROUTES.over];
	}
};

const RUN_SCREEN_PATHS: readonly string[] = Object.values(RUN_ROUTES);

/**
 * The redirect verdict for the route sync: where the player must be moved,
 * or null to stay put. Null while loading — a stale cached view must never
 * cause a redirect. Null for paths outside the run's own screens: mid-
 * transition to elsewhere (the community detour, /dex, …) the layout is
 * still briefly mounted with the new pathname, and policing it would drag
 * the player back into the run.
 */
export const syncTarget = (
	pathname: string,
	view: Pick<RunView, "status"> | null,
	isPending: boolean
): RunRoutePath | null => {
	if (isPending) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
