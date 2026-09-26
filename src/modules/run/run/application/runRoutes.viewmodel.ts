import type { RunView } from "~/modules/run/run/application/runView.viewmodel";

const RUN_ROUTES = {
	start: "/run",
	new: "/run/new",
	prep: "/run/prep",
	poll: "/run/poll",
	gate: "/run/gate",
	review: "/run/review",
	shop: "/run/shop",
	over: "/run/over",
} as const;

type RunRoutePath = (typeof RUN_ROUTES)[keyof typeof RUN_ROUTES];

const COMMUNITY_ROUTE = "/run/community";

const isHub = (pathname: string) => pathname === RUN_ROUTES.start;

type SyncTargetPath = RunRoutePath | typeof COMMUNITY_ROUTE;

type SyncView = Pick<
	RunView,
	"status" | "gatesCleared" | "redoingGate" | "peelSlotsRemaining"
>;

const routesForStatus = (
	view: SyncView | null
): readonly [RunRoutePath, ...RunRoutePath[]] => {
	if (!view) return [RUN_ROUTES.start];
	switch (view.status) {
		case "configuring":
			return [RUN_ROUTES.new, RUN_ROUTES.prep];
		case "answering":
			return view.gatesCleared > 0
				? [RUN_ROUTES.prep, RUN_ROUTES.poll]
				: [RUN_ROUTES.poll];
		case "rewarding":
			return view.redoingGate !== null
				? [RUN_ROUTES.shop, RUN_ROUTES.prep, RUN_ROUTES.review]
				: [
						RUN_ROUTES.gate,
						RUN_ROUTES.review,
						RUN_ROUTES.shop,
						RUN_ROUTES.prep,
					];
		case "awaiting-strip":
			return view.peelSlotsRemaining === 0
				? [RUN_ROUTES.review, RUN_ROUTES.gate]
				: [RUN_ROUTES.gate, RUN_ROUTES.review];
		case "won":
		case "dead":
			return [RUN_ROUTES.over];
	}
};

export type CommunityReturn = {
	readonly path: RunRoutePath;
	readonly label: string;
};

export const resumeTarget = (view: SyncView): RunRoutePath =>
	view.status === "rewarding" ? RUN_ROUTES.prep : routesForStatus(view)[0];

export const returnFromCommunity = (view: SyncView | null): CommunityReturn => {
	if (!view) return { path: RUN_ROUTES.start, label: "Today’s climb →" };

	return { path: resumeTarget(view), label: "Back to your run →" };
};

const RUN_SCREEN_PATHS: readonly string[] = Object.values(RUN_ROUTES);

export const syncTarget = (
	pathname: string,
	view: (SyncView & Pick<RunView, "awaitingTomorrow">) | null,
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
