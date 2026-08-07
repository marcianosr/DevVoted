import type { RunView } from "./runView.viewmodel";

export const RUN_ROUTES = {
	start: "/run",
	configure: "/run/configure",
	answer: "/run/answer",
	reward: "/run/reward",
	review: "/run/review",
	shop: "/run/shop",
	strip: "/run/strip",
	over: "/run/over",
} as const;

export type RunRoutePath = (typeof RUN_ROUTES)[keyof typeof RUN_ROUTES];

/**
 * Deliberately NOT in RUN_ROUTES: the community board is a breather outside
 * the climb, so the sync must never police it — it is only ever a target.
 */
export const COMMUNITY_ROUTE = "/run/community";

export type SyncTargetPath = RunRoutePath | typeof COMMUNITY_ROUTE;

/**
 * The server owns the run's state machine; the URL only projects it. This maps
 * each status to the route(s) allowed to show it — first entry is canonical.
 * "rewarding" spans three routes because reward → review → shop are user-driven
 * page turns within one server status, and "awaiting-strip" spans two for the
 * same reason: strip → review. Both ends of a gate close on the answers, and on
 * neither path does reading them advance the run — the action that does sits on
 * the last page of the sequence.
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
			return [RUN_ROUTES.reward, RUN_ROUTES.review, RUN_ROUTES.shop];
		case "awaiting-strip":
			return [RUN_ROUTES.strip, RUN_ROUTES.review];
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
 *
 * The daily lock overrides the status map: awaiting tomorrow's polls there
 * is nothing to show on any run screen, so the player lands on the
 * community board — the day's closing beat (ADR-014, DVTD-zfuv).
 */
export const syncTarget = (
	pathname: string,
	view: Pick<RunView, "status" | "awaitingTomorrow"> | null,
	isPending: boolean
): SyncTargetPath | null => {
	if (isPending) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	if (view?.awaitingTomorrow) return COMMUNITY_ROUTE;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
