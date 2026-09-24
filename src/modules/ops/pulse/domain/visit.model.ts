export type DeviceClass = "desktop" | "mobile" | "tablet" | "bot";

/** One visitor's day on one screen. Never a page view: `app_visits` counts repeats in `hits`. */
export type Visit = {
	readonly date: string;
	readonly visitorHash: string;
	readonly routeId: string;
	readonly userId: string | null;
	readonly device: DeviceClass;
	readonly country: string | null;
	readonly referrerHost: string | null;
};

/**
 * Every route id the generated tree can match. A closed set rather than a
 * pattern: the recording endpoint is unauthenticated, and an allowlist means a
 * forged id writes nothing at all, where a regex would let junk inflate the
 * screen funnel. `visitRoutes.spec.ts` fails if this drifts from the generated
 * tree, so adding a route cannot silently lose its visits.
 */
export const KNOWN_ROUTE_IDS = [
	"/",
	"/_authed",
	"/login",
	"/logout",
	"/presentation",
	"/proto-run",
	"/sign-up",
	"/_authed/run",
	"/_authed/admin",
	"/_authed/dex",
	"/auth/callback",
	"/_authed/polls/new",
	"/_authed/profile/$userId",
	"/_authed/run/gate",
	"/_authed/run/new",
	"/_authed/run/over",
	"/_authed/run/poll",
	"/_authed/run/prep",
	"/_authed/run/review",
	"/_authed/run/shop",
	"/_authed/run_/community",
	"/_authed/runs/$runId",
	"/_authed/polls/",
	"/_authed/run/",
	"/_authed/polls/$pollId/edit",
	"/_authed/polls/$pollId/",
] as const;

const ROUTE_IDS = new Set<string>(KNOWN_ROUTE_IDS);

export const isKnownRouteId = (routeId: string): boolean =>
	ROUTE_IDS.has(routeId);

const BOT_MARKERS = [
	"bot",
	"crawler",
	"spider",
	"slurp",
	"headlesschrome",
	"lighthouse",
	"facebookexternalhit",
	"preview",
];

const isBot = (agent: string) =>
	BOT_MARKERS.some((marker) => agent.includes(marker));

// An Android tablet says "Android" without "Mobile" — the absence is the signal.
const isTablet = (agent: string) =>
	agent.includes("ipad") ||
	(agent.includes("android") && !agent.includes("mobile"));

const isMobile = (agent: string) =>
	agent.includes("mobile") ||
	agent.includes("iphone") ||
	agent.includes("ipod") ||
	agent.includes("android");

/** Coarse on purpose: a class, never a fingerprint and never a model. */
export const deviceClassOf = (userAgent: string): DeviceClass => {
	const agent = userAgent.toLowerCase();
	if (isBot(agent)) return "bot";
	if (isTablet(agent)) return "tablet";
	if (isMobile(agent)) return "mobile";
	return "desktop";
};

/**
 * The referrer's host alone — never the full URL, which can carry a search
 * query or a path identifying the visitor. Our own host reads as null: on an
 * in-app navigation the Referer is always us, which is noise, not a referral.
 */
export const referrerHostOf = (
	referer: string | null,
	selfHost: string
): string | null => {
	if (!referer) return null;
	try {
		const host = new URL(referer).hostname.toLowerCase().replace(/^www\./, "");
		if (host === selfHost.toLowerCase().replace(/^www\./, "")) return null;
		return host;
	} catch {
		return null;
	}
};

export const countryOf = (header: string | null): string | null => {
	if (!header || header.length !== 2) return null;
	return header.toUpperCase();
};
