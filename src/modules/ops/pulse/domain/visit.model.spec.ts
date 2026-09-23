import { describe, expect, it } from "vitest";

import {
	countryOf,
	deviceClassOf,
	isKnownRouteId,
	referrerHostOf,
} from "~/modules/ops/pulse/domain/visit.model";

const IPHONE =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const IPAD =
	"Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const ANDROID_TABLET =
	"Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const MAC_CHROME =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const GOOGLEBOT =
	"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("deviceClassOf", () => {
	it("reads an iPhone as mobile", () => {
		expect(deviceClassOf(IPHONE)).toBe("mobile");
	});

	it("reads an iPad as tablet, not mobile, despite the Mobile token", () => {
		expect(deviceClassOf(IPAD)).toBe("tablet");
	});

	// An Android tablet says "Android" without "Mobile": the absence is the signal.
	it("reads an Android without the Mobile token as tablet", () => {
		expect(deviceClassOf(ANDROID_TABLET)).toBe("tablet");
	});

	it("reads desktop Chrome as desktop", () => {
		expect(deviceClassOf(MAC_CHROME)).toBe("desktop");
	});

	it("reads Googlebot as bot, so crawler traffic can be excluded rather than counted", () => {
		expect(deviceClassOf(GOOGLEBOT)).toBe("bot");
	});

	it("falls back to desktop when the agent is empty", () => {
		expect(deviceClassOf("")).toBe("desktop");
	});
});

describe("isKnownRouteId", () => {
	it("accepts a generated route pattern", () => {
		expect(isKnownRouteId("/_authed/runs/$runId")).toBe(true);
	});

	// The endpoint is unauthenticated, so anything not in the tree writes nothing.
	it("rejects a resolved url, which would leak a real id into the funnel", () => {
		expect(isKnownRouteId("/_authed/runs/482")).toBe(false);
	});

	it("rejects an empty id", () => {
		expect(isKnownRouteId("")).toBe(false);
	});

	it("rejects a traversal attempt", () => {
		expect(isKnownRouteId("../../etc/passwd")).toBe(false);
	});
});

describe("referrerHostOf", () => {
	it("keeps the host and drops the path and query", () => {
		expect(
			referrerHostOf("https://news.ycombinator.com/item?id=123", "devvoted.dev")
		).toBe("news.ycombinator.com");
	});

	it("strips www so one referrer is one row", () => {
		expect(
			referrerHostOf("https://www.reddit.com/r/webdev", "devvoted.dev")
		).toBe("reddit.com");
	});

	// On an in-app navigation the Referer is always us, which is noise.
	it("reads our own host as no referrer", () => {
		expect(
			referrerHostOf("https://devvoted.dev/run/poll", "devvoted.dev")
		).toBe(null);
	});

	it("returns null for an unparseable referrer rather than throwing", () => {
		expect(referrerHostOf("not a url", "devvoted.dev")).toBe(null);
	});

	it("returns null when there is no referrer at all", () => {
		expect(referrerHostOf(null, "devvoted.dev")).toBe(null);
	});
});

describe("countryOf", () => {
	it("uppercases a two-letter code", () => {
		expect(countryOf("nl")).toBe("NL");
	});

	it("rejects anything that is not two letters, so the column stays a country", () => {
		expect(countryOf("NLD")).toBe(null);
		expect(countryOf("")).toBe(null);
		expect(countryOf(null)).toBe(null);
	});
});
