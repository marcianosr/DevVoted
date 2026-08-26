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

const isHub = (pathname: string) => pathname === RUN_ROUTES.start;

type SyncTargetPath = RunRoutePath | typeof COMMUNITY_ROUTE;

const routesForStatus = (
	view: Pick<RunView, "status" | "gatesCleared" | "redoingGate"> | null
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
			// A retry shares the clear's status but not its payout screen: the
			// reward screen is a "+KB, gate cleared" celebration, and the gate it
			// would name is the one just missed (ADR-037). The failure's own report
			// was the strip screen; from here the loop is shop, prep, same gate.
			return view.redoingGate !== null
				? [RUN_ROUTES.shop, RUN_ROUTES.prep, RUN_ROUTES.review]
				: [
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

export type CommunityReturn = {
	readonly path: RunRoutePath;
	readonly label: string;
};

export const resumeTarget = (
	view: Pick<RunView, "status" | "gatesCleared" | "redoingGate">
): RunRoutePath =>
	view.status === "rewarding" ? RUN_ROUTES.prep : routesForStatus(view)[0];

export const returnFromCommunity = (
	view: Pick<RunView, "status" | "gatesCleared" | "redoingGate"> | null
): CommunityReturn => {
	if (!view) return { path: RUN_ROUTES.start, label: "Today’s climb →" };

	return { path: resumeTarget(view), label: "Back to your run →" };
};

const RUN_SCREEN_PATHS: readonly string[] = Object.values(RUN_ROUTES);

export const syncTarget = (
	pathname: string,
	view: Pick<
		RunView,
		"status" | "awaitingTomorrow" | "gatesCleared" | "redoingGate"
	> | null,
	statusUnknown: boolean
): SyncTargetPath | null => {
	if (statusUnknown) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	if (isHub(pathname)) return null;
	if (view?.awaitingTomorrow) return COMMUNITY_ROUTE;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
