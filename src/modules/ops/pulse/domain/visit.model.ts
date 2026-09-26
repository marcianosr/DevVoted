export type DeviceClass = "desktop" | "mobile" | "tablet" | "bot";

export type Visit = {
	readonly date: string;
	readonly visitorHash: string;
	readonly routeId: string;
	readonly userId: string | null;
	readonly device: DeviceClass;
	readonly country: string | null;
	readonly referrerHost: string | null;
};

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

const isTablet = (agent: string) =>
	agent.includes("ipad") ||
	(agent.includes("android") && !agent.includes("mobile"));

const isMobile = (agent: string) =>
	agent.includes("mobile") ||
	agent.includes("iphone") ||
	agent.includes("ipod") ||
	agent.includes("android");

export const deviceClassOf = (userAgent: string): DeviceClass => {
	const agent = userAgent.toLowerCase();
	if (isBot(agent)) return "bot";
	if (isTablet(agent)) return "tablet";
	if (isMobile(agent)) return "mobile";
	return "desktop";
};

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
