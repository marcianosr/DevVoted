import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
	isSameOrigin,
	visitorContextOf,
	visitorHashOf,
	type RequestFacts,
} from "~/modules/ops/pulse/infrastructure/visitor.repository";
import { TEST_DATES } from "~/test/kanto";

/**
 * Only the pure half is covered here. `readRequestFacts` calls
 * `@tanstack/react-start/server`, which vitest replaces with an import-
 * protection stub, so it cannot be exercised in a unit test at all — which is
 * precisely why every decision was moved off it and onto `RequestFacts`.
 */
const CHROME =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

const factsOf = (overrides: Partial<RequestFacts> = {}): RequestFacts => ({
	ip: "81.1.2.3",
	userAgent: CHROME,
	country: null,
	referer: null,
	selfHost: "devvoted.dev",
	fetchSite: null,
	origin: null,
	...overrides,
});

beforeEach(() => {
	process.env.VISIT_HASH_SECRET = "pewter-city-museum";
});

afterEach(() => {
	delete process.env.VISIT_HASH_SECRET;
});

describe("visitorHashOf", () => {
	// The whole banner-free argument rests on this one property.
	it("gives the same visitor a different identity tomorrow", () => {
		expect(visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME)).not.toBe(
			visitorHashOf(TEST_DATES.christmas, "81.1.2.3", CHROME)
		);
	});

	it("gives the same visitor one identity within a day, so the day can be counted", () => {
		expect(visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME)).toBe(
			visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME)
		);
	});

	it("separates two visitors sharing an address but not an agent", () => {
		expect(visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME)).not.toBe(
			visitorHashOf(TEST_DATES.birthday, "81.1.2.3", "Firefox/121.0")
		);
	});

	it("never carries the address it was built from", () => {
		const hash = visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME);

		expect(hash).not.toContain("81.1.2.3");
		expect(hash).toMatch(/^[0-9a-f]{32}$/);
	});

	// A missing secret must read as no data, never as weak data.
	it("refuses to hash at all when the secret is unset", () => {
		delete process.env.VISIT_HASH_SECRET;

		expect(visitorHashOf(TEST_DATES.birthday, "81.1.2.3", CHROME)).toBe(null);
	});
});

describe("visitorContextOf", () => {
	it("derives the device class, the country and the referring host", () => {
		expect(
			visitorContextOf(
				TEST_DATES.birthday,
				factsOf({
					country: "nl",
					referer: "https://news.ycombinator.com/item?id=1",
				})
			)
		).toMatchObject({
			device: "desktop",
			country: "NL",
			referrerHost: "news.ycombinator.com",
		});
	});

	it("drops our own host as a referrer, since an in-app navigation is not a referral", () => {
		expect(
			visitorContextOf(
				TEST_DATES.birthday,
				factsOf({ referer: "https://devvoted.dev/run/poll" })
			)?.referrerHost
		).toBe(null);
	});

	it("returns nothing at all when the secret is unset", () => {
		delete process.env.VISIT_HASH_SECRET;

		expect(visitorContextOf(TEST_DATES.birthday, factsOf())).toBe(null);
	});
});

describe("isSameOrigin", () => {
	it("allows an in-app navigation", () => {
		expect(isSameOrigin(factsOf({ fetchSite: "same-origin" }))).toBe(true);
	});

	// A typed-in address is the entry visit this exists to count.
	it("allows a direct address-bar load", () => {
		expect(isSameOrigin(factsOf({ fetchSite: "none" }))).toBe(true);
	});

	it("rejects a request posted from another site", () => {
		expect(isSameOrigin(factsOf({ fetchSite: "cross-site" }))).toBe(false);
	});

	it("falls back to the origin header when the browser sent no fetch metadata", () => {
		expect(isSameOrigin(factsOf({ origin: "https://evil.example.com" }))).toBe(
			false
		);
		expect(isSameOrigin(factsOf({ origin: "https://devvoted.dev" }))).toBe(
			true
		);
	});

	it("allows a request that carries neither, which is the server-render case", () => {
		expect(isSameOrigin(factsOf())).toBe(true);
	});
});
