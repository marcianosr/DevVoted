import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

export const RUN_ROUTES = {
	start: "/run",
	configure: "/run/configure",
	prep: "/run/prep",
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

export const routesForStatus = (
	view: Pick<RunView, "status" | "gatesCleared"> | null
): readonly [RunRoutePath, ...RunRoutePath[]] => {
	if (!view) return [RUN_ROUTES.start];
	switch (view.status) {
		case "configuring":
			return [RUN_ROUTES.configure];
		case "answering":
			return view.gatesCleared > 0
				? [RUN_ROUTES.prep, RUN_ROUTES.answer]
				: [RUN_ROUTES.answer];
		case "rewarding":
			return [
				RUN_ROUTES.reward,
				RUN_ROUTES.review,
				RUN_ROUTES.shop,
				RUN_ROUTES.prep,
			];
		case "awaiting-strip":
			return [RUN_ROUTES.strip, RUN_ROUTES.review];
		case "won":
		case "dead":
			return [RUN_ROUTES.over];
	}
};

const RUN_SCREEN_PATHS: readonly string[] = Object.values(RUN_ROUTES);

export const syncTarget = (
	pathname: string,
	view: Pick<RunView, "status" | "awaitingTomorrow" | "gatesCleared"> | null,
	isPending: boolean
): SyncTargetPath | null => {
	if (isPending) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	if (view?.awaitingTomorrow) return COMMUNITY_ROUTE;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
