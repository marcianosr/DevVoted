import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

const RUN_ROUTES = {
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

type RunRoutePath = (typeof RUN_ROUTES)[keyof typeof RUN_ROUTES];

/**
 * Deliberately NOT in RUN_ROUTES: the community board is a breather outside
 * the climb, so the sync must never police it — it is only ever a target.
 */
const COMMUNITY_ROUTE = "/run/community";

type SyncTargetPath = RunRoutePath | typeof COMMUNITY_ROUTE;

const routesForStatus = (
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

/**
 * `statusUnknown` covers both ways the run status can be un-askable: still
 * loading, or failed to load. A null `view` is otherwise a real answer ("no run
 * today"), so acting on it while the read is unresolved would move the player
 * off their screen on the strength of data that never arrived (DVTD-cmqj).
 */
export const syncTarget = (
	pathname: string,
	view: Pick<RunView, "status" | "awaitingTomorrow" | "gatesCleared"> | null,
	statusUnknown: boolean
): SyncTargetPath | null => {
	if (statusUnknown) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	if (view?.awaitingTomorrow) return COMMUNITY_ROUTE;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
