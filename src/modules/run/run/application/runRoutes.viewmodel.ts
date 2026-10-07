import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";

export const RUN_ROUTES = {
	start: "/run",
	new: "/run/new",
	prep: "/run/prep",
	poll: "/run/poll",
	gate: "/run/gate",
	review: "/run/review",
	shop: "/run/shop",
	over: "/run/over",
} as const;

export type RunRoutePath = (typeof RUN_ROUTES)[keyof typeof RUN_ROUTES];

export const COMMUNITY_ROUTE = "/run/community";

const isHub = (pathname: string) => pathname === RUN_ROUTES.start;

export type RunLinkPath = RunRoutePath | typeof COMMUNITY_ROUTE;

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
			return [RUN_ROUTES.over, RUN_ROUTES.review];
	}
};

export const canReview = (view: SyncView | null): boolean =>
	routesForStatus(view).includes(RUN_ROUTES.review);

export type RouteBack = {
	readonly path: RunRoutePath;
	readonly label: string;
};

export const resumeTarget = (view: SyncView): RunRoutePath =>
	view.status === "rewarding" ? RUN_ROUTES.prep : routesForStatus(view)[0];

export const returnFromCommunity = (view: SyncView | null): RouteBack => {
	if (!view) return { path: RUN_ROUTES.start, label: "Today’s climb →" };

	return { path: resumeTarget(view), label: "Back to your run →" };
};

type ForwardScreen = "new" | "prep" | "gate" | "shop" | "over";

export const nextFrom = (
	screen: ForwardScreen,
	view: SyncView | null
): RunRoutePath | null => {
	switch (screen) {
		case "new":
		case "shop":
			return RUN_ROUTES.prep;
		case "prep":
			return view?.status === "answering" ? RUN_ROUTES.poll : null;
		case "gate":
			return view?.status === "awaiting-strip"
				? RUN_ROUTES.review
				: RUN_ROUTES.shop;
		case "over":
			return RUN_ROUTES.start;
	}
};

const BACK_TO_BUILD: RouteBack = {
	path: RUN_ROUTES.new,
	label: "← Back to the build",
};
const BACK_TO_SHOP: RouteBack = {
	path: RUN_ROUTES.shop,
	label: "Back to the shop",
};
const BACK_TO_GATE: RouteBack = {
	path: RUN_ROUTES.gate,
	label: "Back to the gate",
};
const BACK_TO_RESULT: RouteBack = {
	path: RUN_ROUTES.over,
	label: "Back to the result",
};

const isFinished = (view: SyncView): boolean =>
	view.status === "won" || view.status === "dead";

export const reviewBackOf = (view: SyncView): RouteBack =>
	isFinished(view) ? BACK_TO_RESULT : BACK_TO_GATE;

export const prepBackOf = (view: SyncView): RouteBack | null => {
	if (view.status === "configuring") return BACK_TO_BUILD;
	return view.status === "rewarding" ? BACK_TO_SHOP : null;
};

type PrepDeparture = Extract<RunAction, { type: "start" | "finish-reward" }>;

export const prepDepartureOf = (view: SyncView): PrepDeparture | null => {
	if (view.status === "configuring") return { type: "start" };
	return view.status === "rewarding" ? { type: "finish-reward" } : null;
};

const RUN_SCREEN_PATHS: readonly string[] = Object.values(RUN_ROUTES);

export const syncTarget = (
	pathname: string,
	view: (SyncView & Pick<RunView, "awaitingTomorrow">) | null,
	statusUnknown: boolean
): RunLinkPath | null => {
	if (statusUnknown) return null;
	if (!RUN_SCREEN_PATHS.includes(pathname)) return null;
	if (isHub(pathname)) return null;
	if (view?.awaitingTomorrow) return COMMUNITY_ROUTE;
	const allowed = routesForStatus(view);
	const isOnAllowedScreen = allowed.some((path) => path === pathname);
	return isOnAllowedScreen ? null : allowed[0];
};
